import { useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Text,
  Badge,
  ProgressBar,
  Box,
  Divider,
  Banner,
  Icon,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);

  try {
    const store = await db.store.findUnique({
      where: { shopDomain: session.shop },
    });

    const totalChats = await db.chatMessage.count({
      where: { storeId: store?.id },
    });

    const totalSessions = await db.chatSession.count({
      where: { storeId: store?.id },
    });

    const activeFAQs = await db.fAQ.count({
      where: { 
        storeId: store?.id,
        isActive: true 
      },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayChats = await db.chatMessage.count({
      where: {
        storeId: store?.id,
        createdAt: { gte: todayStart },
      },
    });

    const recentChats = await db.chatMessage.findMany({
      where: { storeId: store?.id },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        message: true,
        role: true,
        createdAt: true,
      },
    });

    return json({
      shop: session.shop,
      plan: store?.plan || 'free',
      totalChats,
      totalSessions,
      activeFAQs,
      todayChats,
      recentChats,
      isNewUser: totalChats === 0,
    });
  } catch (error) {
    return json({
      shop: session.shop,
      plan: 'free',
      totalChats: 0,
      totalSessions: 0,
      activeFAQs: 0,
      todayChats: 0,
      recentChats: [],
      isNewUser: true,
    });
  }
}

export default function DashboardPage() {
  const { shop, plan, totalChats, totalSessions, activeFAQs, todayChats, recentChats, isNewUser } = useLoaderData<typeof loader>();

  const planLimits = {
    free: 50,
    starter: 500,
    professional: 2000,
    enterprise: 999999,
  };

  const chatLimit = planLimits[plan as keyof typeof planLimits] || 50;
  const usagePercent = Math.min((totalChats / chatLimit) * 100, 100);

  // Get plan display name
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1);
  
  // Get plan badge
  const getPlanBadge = () => {
    switch(plan) {
      case 'free': return { tone: 'attention' as const, text: 'Free' };
      case 'starter': return { tone: 'info' as const, text: 'Starter' };
      case 'professional': return { tone: 'success' as const, text: 'Pro' };
      case 'enterprise': return { tone: 'success' as const, text: 'Enterprise' };
      default: return { tone: 'attention' as const, text: 'Free' };
    }
  };

  const planBadge = getPlanBadge();

  return (
    <Page
      title="Dashboard"
      subtitle={`Welcome to AI Chat Support for ${shop}`}
    >
      <Layout>
        {/* New User Onboarding Banner */}
        {isNewUser && (
          <Layout.Section>
            <Banner
              title="👋 Welcome! Let's get your AI chatbot up and running"
              tone="success"
            >
              <BlockStack gap="200">
                <Text as="p" variant="bodyMd">
                  Get started in 3 simple steps:
                </Text>
                <InlineStack gap="200">
                  <Button url="/app/install" variant="primary">
                    1. Install Widget
                  </Button>
                  <Button url="/app/faqs">
                    2. Add FAQs
                  </Button>
                  <Button url="/app/settings">
                    3. Customize
                  </Button>
                </InlineStack>
              </BlockStack>
            </Banner>
          </Layout.Section>
        )}

        {/* Key Stats - 4 Cards in a Row */}
        <Layout.Section>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {/* Total Conversations */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="start">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Conversations
                  </Text>
                  <Text as="span" variant="bodyLg" fontWeight="bold">
                    💬
                  </Text>
                </InlineStack>
                <Text as="h2" variant="heading2xl" fontWeight="bold">
                  {totalSessions}
                </Text>
                {todayChats > 0 && (
                  <Badge tone="success" size="small">+{todayChats} today</Badge>
                )}
              </BlockStack>
            </Card>

            {/* Total Messages */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="start">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Messages
                  </Text>
                  <Text as="span" variant="bodyLg" fontWeight="bold">
                    📨
                  </Text>
                </InlineStack>
                <Text as="h2" variant="heading2xl" fontWeight="bold">
                  {totalChats}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  of {chatLimit === 999999 ? '∞' : chatLimit}
                </Text>
              </BlockStack>
            </Card>

            {/* Active FAQs */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="start">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Active FAQs
                  </Text>
                  <Text as="span" variant="bodyLg" fontWeight="bold">
                    ❓
                  </Text>
                </InlineStack>
                <Text as="h2" variant="heading2xl" fontWeight="bold">
                  {activeFAQs}
                </Text>
                <Button url="/app/faqs" plain size="slim">
                  Manage →
                </Button>
              </BlockStack>
            </Card>

            {/* Current Plan */}
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="start">
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Plan
                  </Text>
                  <Text as="span" variant="bodyLg" fontWeight="bold">
                    ⭐
                  </Text>
                </InlineStack>
                <InlineStack gap="200" blockAlign="center">
                  <Text as="h2" variant="headingLg" fontWeight="bold">
                    {planName}
                  </Text>
                  <Badge tone={planBadge.tone} size="small">{planBadge.text}</Badge>
                </InlineStack>
                {plan === 'free' && (
                  <Button url="/app/billing" plain size="slim">
                    Upgrade →
                  </Button>
                )}
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>

        {/* Usage Progress */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h3" variant="headingMd">
                    Monthly Usage
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {totalChats} of {chatLimit === 999999 ? 'unlimited' : `${chatLimit} messages used`}
                  </Text>
                </BlockStack>
                <Text as="span" variant="headingLg" fontWeight="bold">
                  {usagePercent.toFixed(0)}%
                </Text>
              </InlineStack>
              
              <ProgressBar
                progress={usagePercent}
                size="medium"
                tone={usagePercent > 90 ? "critical" : usagePercent > 70 ? "attention" : "success"}
              />

              {usagePercent > 80 && (
                <Banner tone={usagePercent > 90 ? "critical" : "warning"}>
                  <Text as="p" variant="bodyMd">
                    {usagePercent > 90 
                      ? "⚠️ You're running low on messages. Upgrade to avoid interruptions."
                      : "💡 You're using most of your monthly messages. Consider upgrading."}
                  </Text>
                </Banner>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Quick Actions */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Quick Actions
              </Text>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <Button url="/app/install" variant="primary" size="large" fullWidth>
                  ⚡ Install Widget
                </Button>
                <Button url="/app/faqs" size="large" fullWidth>
                  📝 Manage FAQs
                </Button>
                <Button url="/app/settings" size="large" fullWidth>
                  ⚙️ Settings
                </Button>
                <Button url="/app/analytics" size="large" fullWidth>
                  📊 Analytics
                </Button>
                <Button url="/app/realtime" size="large" fullWidth>
                  💬 Live Chat
                </Button>
                <Button url={`https://${shop}`} external size="large" fullWidth>
                  🌐 View Store
                </Button>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Recent Activity */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h3" variant="headingMd">
                  Recent Conversations
                </Text>
                {recentChats.length > 0 && (
                  <Button url="/app/realtime" plain>
                    View all →
                  </Button>
                )}
              </InlineStack>

              <Divider />

              {recentChats.length === 0 ? (
                <Box padding="600">
                  <BlockStack gap="300" inlineAlign="center">
                    <Text as="p" variant="headingLg" alignment="center">
                      💬
                    </Text>
                    <Text as="p" variant="headingMd" alignment="center">
                      No conversations yet
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued" alignment="center">
                      Install the widget to start receiving customer messages
                    </Text>
                    <Button url="/app/install" variant="primary">
                      Install Widget Now
                    </Button>
                  </BlockStack>
                </Box>
              ) : (
                <BlockStack gap="300">
                  {recentChats.map((chat, index) => (
                    <Box
                      key={chat.id}
                      padding="400"
                      background="bg-surface-secondary"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <InlineStack align="space-between" blockAlign="center">
                          <InlineStack gap="200" blockAlign="center">
                            <Badge tone={chat.role === 'user' ? 'info' : 'success'}>
                              {chat.role === 'user' ? '👤 Customer' : '🤖 AI'}
                            </Badge>
                            <Text as="span" variant="bodySm" tone="subdued">
                              {new Date(chat.createdAt).toLocaleTimeString()}
                            </Text>
                          </InlineStack>
                        </InlineStack>
                        <Text as="p" variant="bodyMd">
                          {chat.message.length > 120 
                            ? `${chat.message.substring(0, 120)}...` 
                            : chat.message}
                        </Text>
                      </BlockStack>
                    </Box>
                  ))}
                </BlockStack>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Help & Resources */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                📚 Help & Resources
              </Text>
              <Divider />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      📖 Documentation
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Learn how to use all features
                    </Text>
                    <Button url="/app/help" plain size="slim">
                      Read docs →
                    </Button>
                  </BlockStack>
                </Box>

                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      💳 Billing
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Manage your subscription plan
                    </Text>
                    <Button url="/app/billing" plain size="slim">
                      View plans →
                    </Button>
                  </BlockStack>
                </Box>

                <Box padding="400" background="bg-surface-secondary" borderRadius="200">
                  <BlockStack gap="200">
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      💬 Support
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Get help from our team
                    </Text>
                    <Text as="p" variant="bodySm">
                      support@indigenservices.com
                    </Text>
                  </BlockStack>
                </Box>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
