import { useState } from "react";
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
  Banner,
  List,
  Badge,
  Divider,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  
  return json({
    shop: session.shop,
    apiKey: process.env.SHOPIFY_API_KEY,
  });
}

export default function InstallWidgetPage() {
  const { shop, apiKey } = useLoaderData<typeof loader>();
  const [copied, setCopied] = useState(false);
  const shopify = useAppBridge();

  const themeUrl = `https://${shop}/admin/themes`;
  const customizeUrl = `https://${shop}/admin/themes/current/editor`;

  const openThemeCustomizer = () => {
    // Open theme editor in new tab
    window.open(customizeUrl, '_blank', 'noopener,noreferrer');
  };

  const openThemesPage = () => {
    // Open themes page in new tab
    window.open(themeUrl, '_blank', 'noopener,noreferrer');
  };

  const openStorefront = () => {
    // Open storefront in new tab
    window.open(`https://${shop}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Page>
      <TitleBar title="Install Chat Widget" />
      
      <Layout>
        <Layout.Section>
          <Banner tone="info">
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd" fontWeight="semibold">
                🎉 Good news! Installation is super easy with Theme Extension
              </Text>
              <Text as="p" variant="bodyMd">
                No code editing required - just toggle it on in Theme Customizer!
              </Text>
            </BlockStack>
          </Banner>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="500">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingLg">
                  ⚡ One-Click Installation
                </Text>
                <Badge tone="success">Recommended</Badge>
              </InlineStack>

              <Divider />

              <BlockStack gap="400">
                <Box>
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center">
                      <Box 
                        background="bg-fill-info" 
                        padding="200" 
                        borderRadius="100"
                        minWidth="32px"
                        minHeight="32px"
                      >
                        <Text as="span" variant="headingMd" alignment="center">
                          1
                        </Text>
                      </Box>
                      <Text as="h3" variant="headingMd">
                        Open Theme Customizer
                      </Text>
                    </InlineStack>
                    
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Click the button below to open your theme editor:
                    </Text>

                    <InlineStack gap="200">
                      <Button
                        onClick={openThemeCustomizer}
                        variant="primary"
                        size="large"
                      >
                        Open Theme Customizer
                      </Button>
                      <Button
                        onClick={openThemesPage}
                      >
                        Or Go to Themes Page
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Box>

                <Divider />

                <Box>
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center">
                      <Box 
                        background="bg-fill-info" 
                        padding="200" 
                        borderRadius="100"
                        minWidth="32px"
                      >
                        <Text as="span" variant="headingMd" alignment="center">
                          2
                        </Text>
                      </Box>
                      <Text as="h3" variant="headingMd">
                        Find App Embeds Section
                      </Text>
                    </InlineStack>
                    
                    <Box
                      background="bg-surface-secondary"
                      padding="400"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd">
                          In the Theme Customizer left sidebar:
                        </Text>
                        <List type="number">
                          <List.Item>Scroll down to the bottom</List.Item>
                          <List.Item>Look for <strong>"App embeds"</strong> section</List.Item>
                          <List.Item>Click to expand it</List.Item>
                        </List>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Box>

                <Divider />

                <Box>
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center">
                      <Box 
                        background="bg-fill-info" 
                        padding="200" 
                        borderRadius="100"
                        minWidth="32px"
                      >
                        <Text as="span" variant="headingMd" alignment="center">
                          3
                        </Text>
                      </Box>
                      <Text as="h3" variant="headingMd">
                        Enable AI Chat Widget
                      </Text>
                    </InlineStack>
                    
                    <Box
                      background="bg-surface-secondary"
                      padding="400"
                      borderRadius="200"
                    >
                      <BlockStack gap="200">
                        <Text as="p" variant="bodyMd">
                          Find and enable the widget:
                        </Text>
                        <List type="number">
                          <List.Item>Look for <strong>"AI Chat Widget"</strong></List.Item>
                          <List.Item>Toggle the switch to <strong>ON</strong> ✅</List.Item>
                          <List.Item>Click <strong>"Save"</strong> (top right)</List.Item>
                        </List>
                        <Banner tone="success">
                          <Text as="p" variant="bodyMd">
                            That's it! The widget is now live on your store! 🎉
                          </Text>
                        </Banner>
                      </BlockStack>
                    </Box>
                  </BlockStack>
                </Box>

                <Divider />

                <Box>
                  <BlockStack gap="300">
                    <InlineStack gap="200" blockAlign="center">
                      <Box 
                        background="bg-fill-success" 
                        padding="200" 
                        borderRadius="100"
                        minWidth="32px"
                      >
                        <Text as="span" variant="headingMd" alignment="center">
                          ✓
                        </Text>
                      </Box>
                      <Text as="h3" variant="headingMd">
                        Test Your Widget
                      </Text>
                    </InlineStack>
                    
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Visit your store to see the chat button in action:
                    </Text>

                    <Button
                      onClick={openStorefront}
                      variant="primary"
                      size="large"
                    >
                      🌐 Visit Your Store
                    </Button>

                    <Text as="p" variant="bodyMd" tone="subdued">
                      Look for the blue chat button in the bottom-right corner!
                    </Text>
                  </BlockStack>
                </Box>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingLg">
                🎨 Customize Your Widget
              </Text>
              <Divider />
              <Text as="p" variant="bodyMd">
                After installation, customize your widget appearance and behavior:
              </Text>
              <List>
                <List.Item>Change colors to match your brand</List.Item>
                <List.Item>Choose widget position (4 corners available)</List.Item>
                <List.Item>Customize welcome message</List.Item>
                <List.Item>Add your FAQs for better responses</List.Item>
              </List>
              <InlineStack gap="200">
                <Button url="/app/settings" variant="primary">
                  Go to Settings
                </Button>
                <Button url="/app/faqs">
                  Manage FAQs
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
