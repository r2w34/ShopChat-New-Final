/**
 * Help & Support Page
 * Documentation, tutorials, and support resources
 */

import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Link,
  List,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  return json({
    supportEmail: "support@indigenservices.com",
    documentationUrl: "https://shopchatai.indigenservices.com/app/help",
    videoTutorialsUrl: "https://www.youtube.com/@shopchatai",
  });
};

export default function HelpPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <Page>
      <TitleBar title="Help & Support" />
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                Welcome to Support
              </Text>
              <Text as="p" variant="bodyMd">
                Get help with your AI chatbot, learn best practices, and connect with our support team.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">📚 Quick Start Guide</Text>
              <Divider />
              <List type="number">
                <List.Item>Go to Settings and configure your chat widget</List.Item>
                <List.Item>Set up your welcome message and AI preferences</List.Item>
                <List.Item>Add FAQs for common questions</List.Item>
                <List.Item>Test the chat on your storefront</List.Item>
                <List.Item>Monitor conversations in Live Chat</List.Item>
              </List>
              <Button url="/app/settings">Go to Settings</Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">🎥 Video Tutorials</Text>
              <Divider />
              <List>
                <List.Item>Getting Started (5 min)</List.Item>
                <List.Item>Customizing Your Chat Widget (3 min)</List.Item>
                <List.Item>Managing FAQs (4 min)</List.Item>
                <List.Item>Understanding Analytics (6 min)</List.Item>
                <List.Item>Advanced AI Settings (8 min)</List.Item>
              </List>
              <Button url={data.videoTutorialsUrl} external>
                Watch Tutorials
              </Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">❓ Frequently Asked Questions</Text>
              <Divider />
              <BlockStack gap="200">
                <BlockStack gap="100">
                  <Text as="p" variant="headingSm">How do I add my OpenAI API key?</Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Go to Settings → AI Configuration → Enter your OpenAI API key. Get one from openai.com.
                  </Text>
                </BlockStack>
                
                <BlockStack gap="100">
                  <Text as="p" variant="headingSm">Why isn't my chatbot responding?</Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Check: 1) Chat is enabled in Settings, 2) OpenAI API key is valid, 3) You haven't exceeded your plan limits.
                  </Text>
                </BlockStack>
                
                <BlockStack gap="100">
                  <Text as="p" variant="headingSm">How do I upgrade my plan?</Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Go to Billing → Choose a plan → Click Subscribe. You'll be redirected to Shopify billing.
                  </Text>
                </BlockStack>

                <BlockStack gap="100">
                  <Text as="p" variant="headingSm">Can I customize the chat widget appearance?</Text>
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Yes! Go to Settings → Widget Appearance to change colors, position, and messages.
                  </Text>
                </BlockStack>
              </BlockStack>
              <Button url="/app/faqs">View All FAQs</Button>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">📧 Contact Support</Text>
              <Divider />
              <BlockStack gap="200">
                <InlineStack gap="200" align="start">
                  <Text as="p" variant="bodyMd">
                    <strong>Email:</strong> {data.supportEmail}
                  </Text>
                </InlineStack>
                <InlineStack gap="200" align="start">
                  <Text as="p" variant="bodyMd">
                    <strong>Response Time:</strong> Within 24 hours (Pro: 4 hours, Enterprise: 1 hour)
                  </Text>
                </InlineStack>
                <InlineStack gap="200" align="start">
                  <Text as="p" variant="bodyMd">
                    <strong>Available:</strong> Monday - Friday, 9 AM - 6 PM EST
                  </Text>
                </InlineStack>
                <Button url={`mailto:${data.supportEmail}`} external>
                  Send Email
                </Button>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd">🔗 Additional Resources</Text>
              <Divider />
              <List>
                <List.Item>
                  <Link url={data.documentationUrl} external>
                    Full Documentation
                  </Link>
                </List.Item>
                <List.Item>
                  <Link url="https://shopchatai.indigenservices.com/app/help" external>
                    Community Forum
                  </Link>
                </List.Item>
                <List.Item>
                  <Link url="https://shopchatai.indigenservices.com" external>
                    Service Status
                  </Link>
                </List.Item>
                <List.Item>
                  <Link url="/app/analytics" removeUnderline={false}>
                    Analytics Dashboard
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
