import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  Banner,
  List,
  Divider,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

const BILLING_PLANS = [
  {
    id: 'free',
    name: 'Free Plan',
    price: 0,
    features: [
      '50 chats per month',
      'Gemini 1.5 Flash AI',
      'Email support',
      '1 language',
      'Basic analytics',
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 29.99,
    features: [
      '500 chats per month',
      'Gemini 2.0 Flash AI',
      'Order tracking',
      'Product recommendations',
      'Email support',
      '5 languages',
      'Advanced analytics',
    ],
    trialDays: 14,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79.99,
    features: [
      '2,000 chats per month',
      'Gemini 1.5 Pro AI',
      'All integrations',
      'Cart abandonment recovery',
      'Analytics dashboard',
      'Multi-language (unlimited)',
      'Priority support (4h)',
      'Custom branding',
    ],
    trialDays: 14,
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.99,
    features: [
      'Unlimited chats',
      'Gemini 1.5 Pro AI',
      'Custom AI training',
      'WhatsApp & FB Messenger',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee (1h)',
      'White-label solution',
    ],
    trialDays: 14,
  },
];

export async function action({ request }: ActionFunctionArgs) {
  const { admin, session, billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const planId = formData.get("planId") as string;

  try {
    const plan = BILLING_PLANS.find(p => p.id === planId);
    if (!plan) {
      return json({ success: false, error: "Invalid plan selected" });
    }

    // Free plan - just update database
    if (plan.id === 'free') {
      await db.store.update({
        where: { shopDomain: session.shop },
        data: { 
          plan: planId,
          billingStatus: 'active',
        },
      });
      return json({ success: true, plan: plan.id });
    }

    // Create app subscription using GraphQL Admin API
    const subscriptionMutation = `
      mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $trialDays: Int, $test: Boolean, $lineItems: [AppSubscriptionLineItemInput!]!) {
        appSubscriptionCreate(
          name: $name
          returnUrl: $returnUrl
          trialDays: $trialDays
          test: $test
          lineItems: $lineItems
        ) {
          appSubscription {
            id
            status
            name
            test
          }
          confirmationUrl
          userErrors {
            field
            message
          }
        }
      }
    `;

    const response = await admin.graphql(subscriptionMutation, {
      variables: {
        name: plan.name,
        returnUrl: `https://${session.shop}/admin/apps/${process.env.SHOPIFY_API_KEY}/app/billing?plan=${plan.id}`,
        trialDays: plan.trialDays || 0,
        test: true, // Set to false in production
        lineItems: [
          {
            plan: {
              appRecurringPricingDetails: {
                price: { amount: plan.price, currencyCode: "USD" },
                interval: "EVERY_30_DAYS"
              }
            }
          }
        ]
      }
    });

    const responseJson = await response.json();
    const subscriptionData = responseJson.data?.appSubscriptionCreate;

    if (subscriptionData?.userErrors?.length > 0) {
      console.error("Subscription errors:", subscriptionData.userErrors);
      return json({ 
        success: false, 
        error: subscriptionData.userErrors[0].message 
      });
    }

    // Update database
    await db.store.update({
      where: { shopDomain: session.shop },
      data: { 
        plan: planId,
        billingStatus: 'pending',
      },
    });

    // Return confirmation URL for merchant approval
    return json({ 
      success: true, 
      confirmationUrl: subscriptionData.confirmationUrl,
      plan: plan.id
    });

  } catch (error) {
    console.error("Billing error:", error);
    return json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create subscription"
    });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session, admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const planParam = url.searchParams.get("plan");
  
  try {
    // Check if returning from billing confirmation
    if (planParam) {
      await db.store.update({
        where: { shopDomain: session.shop },
        data: { 
          plan: planParam,
          billingStatus: 'active',
        },
      });
    }

    const store = await db.store.findUnique({
      where: { shopDomain: session.shop },
      select: { 
        plan: true, 
        billingStatus: true,
        shopDomain: true,
      },
    });

    // Check active subscriptions via GraphQL
    const activeSubscriptionsQuery = `
      query {
        currentAppInstallation {
          activeSubscriptions {
            id
            name
            status
            test
            createdAt
            trialDays
            currentPeriodEnd
          }
        }
      }
    `;

    const subscriptionResponse = await admin.graphql(activeSubscriptionsQuery);
    const subscriptionData = await subscriptionResponse.json();
    const activeSubscriptions = subscriptionData.data?.currentAppInstallation?.activeSubscriptions || [];

    return json({
      currentPlan: store?.plan || 'free',
      billingStatus: store?.billingStatus || 'active',
      shop: store?.shopDomain || session.shop,
      activeSubscriptions,
      justApproved: !!planParam,
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json({
      currentPlan: 'free',
      billingStatus: 'active',
      shop: session.shop,
      activeSubscriptions: [],
      justApproved: false,
    });
  }
}

export default function BillingPage() {
  const { currentPlan, billingStatus, shop, activeSubscriptions, justApproved } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    setSubscribing(planId);
    const formData = new FormData();
    formData.append("planId", planId);
    submit(formData, { method: "post" });
  };

  useEffect(() => {
    if (actionData) {
      setSubscribing(null);
      // Redirect to Shopify confirmation page
      if (actionData.success && actionData.confirmationUrl) {
        window.open(actionData.confirmationUrl, '_parent');
      }
    }
  }, [actionData]);

  return (
    <Page>
      <TitleBar title="Billing & Plans" />
      
      <Layout>
        {justApproved && (
          <Layout.Section>
            <Banner title="Subscription Activated!" tone="success">
              <p>Thank you! Your subscription is now active. Enjoy your new features!</p>
            </Banner>
          </Layout.Section>
        )}

        {actionData?.success && !actionData.confirmationUrl && (
          <Layout.Section>
            <Banner title="Plan Updated!" tone="success">
              <p>Your plan has been updated successfully!</p>
            </Banner>
          </Layout.Section>
        )}

        {actionData?.error && (
          <Layout.Section>
            <Banner title="Subscription Error" tone="warning">
              <p>{actionData.error}</p>
            </Banner>
          </Layout.Section>
        )}

        {activeSubscriptions.length > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  Active Subscription
                </Text>
                {activeSubscriptions.map((sub: any) => (
                  <BlockStack key={sub.id} gap="200">
                    <InlineStack gap="200" blockAlign="center">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        {sub.name}
                      </Text>
                      <Badge tone="success">{sub.status}</Badge>
                      {sub.test && <Badge>Test Mode</Badge>}
                    </InlineStack>
                    {sub.trialDays > 0 && (
                      <Text as="p" variant="bodyMd" tone="subdued">
                        Trial period: {sub.trialDays} days
                      </Text>
                    )}
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Current period ends: {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </Text>
                  </BlockStack>
                ))}
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Available Plans
            </Text>
            <Text as="p" variant="bodyMd" tone="subdued">
              Choose the perfect plan for your business. All paid plans include a 14-day free trial.
            </Text>
          </BlockStack>
        </Layout.Section>

        {BILLING_PLANS.map((plan) => (
          <Layout.Section key={plan.id}>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="300" blockAlign="center">
                    <Text as="h3" variant="headingLg">
                      {plan.name}
                    </Text>
                    {plan.popular && (
                      <Badge tone="success">Most Popular</Badge>
                    )}
                    {currentPlan === plan.id && (
                      <Badge tone="info">Current Plan</Badge>
                    )}
                  </InlineStack>
                  <InlineStack gap="100" blockAlign="baseline">
                    <Text as="p" variant="heading2xl">
                      ${plan.price}
                    </Text>
                    <Text as="p" variant="bodyLg" tone="subdued">
                      /month
                    </Text>
                  </InlineStack>
                </InlineStack>

                <Divider />

                <InlineStack gap="800" blockAlign="start">
                  <Box minWidth="60%">
                    <BlockStack gap="200">
                      <Text as="p" variant="bodyMd" fontWeight="semibold">
                        Features included:
                      </Text>
                      <List>
                        {plan.features.map((feature, idx) => (
                          <List.Item key={idx}>
                            <Text as="span" variant="bodyMd">
                              {feature}
                            </Text>
                          </List.Item>
                        ))}
                      </List>
                    </BlockStack>
                  </Box>

                  <Box minWidth="35%">
                    <BlockStack gap="300">
                      {plan.trialDays && (
                        <Banner tone="info">
                          <Text as="p" variant="bodyMd">
                            🎁 {plan.trialDays}-day free trial
                          </Text>
                        </Banner>
                      )}
                      <Button
                        variant={plan.popular ? "primary" : "secondary"}
                        size="large"
                        fullWidth
                        onClick={() => handleSubscribe(plan.id)}
                        loading={subscribing === plan.id}
                        disabled={currentPlan === plan.id}
                      >
                        {currentPlan === plan.id
                          ? "✓ Current Plan"
                          : plan.id === 'free'
                          ? "Switch to Free"
                          : `Subscribe Now - $${plan.price}/mo`}
                      </Button>
                    </BlockStack>
                  </Box>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        ))}

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                💳 Billing Information
              </Text>
              <Divider />
              <List>
                <List.Item>Charges added directly to your Shopify invoice</List.Item>
                <List.Item>14-day free trial on all paid plans</List.Item>
                <List.Item>Cancel anytime from this page</List.Item>
                <List.Item>Automatic monthly billing</List.Item>
                <List.Item>Secure payment via Shopify</List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">
                ❓ Billing FAQs
              </Text>
              <Divider />
              <BlockStack gap="300">
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    How does billing work?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Charges are added directly to your Shopify invoice. You'll be redirected to Shopify's secure approval page.
                  </Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    Can I change plans?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Yes! Upgrade or downgrade anytime. Changes take effect immediately with prorated billing.
                  </Text>
                </BlockStack>
                <BlockStack gap="100">
                  <Text as="p" variant="bodyMd" fontWeight="semibold">
                    How do I cancel?
                  </Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Uninstall the app from your Shopify admin. You'll retain access until the end of your billing period.
                  </Text>
                </BlockStack>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
