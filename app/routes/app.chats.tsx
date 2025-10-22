/**
 * Chat History Page
 * View all past and current chat conversations
 */

import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Card,
  DataTable,
  Badge,
  Button,
  Filters,
  ChoiceList,
  TextField,
  InlineStack,
  Text
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { prisma } from "../db.server";

interface ChatSummary {
  id: string;
  customerName: string;
  customerEmail: string;
  startedAt: string;
  endedAt: string | null;
  status: string;
  messageCount: number;
  aiHandled: boolean;
  assignedAgentName: string | null;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  // Find or create store
  let store = await prisma.store.findUnique({
    where: { shopDomain: session.shop },
  });

  if (!store) {
    store = await prisma.store.create({
      data: {
        shopDomain: session.shop,
        shopName: session.shop.replace('.myshopify.com', ''),
        isActive: true,
      },
    });
  }

  // Parse filters from URL
  const url = new URL(request.url);
  const statusFilter = url.searchParams.get('status') || 'all';
  const searchQuery = url.searchParams.get('search') || '';
  const dateRange = url.searchParams.get('dateRange') || '30';

  // Build where clause
  const where: any = {
    storeId: store.id
  };

  if (statusFilter !== 'all') {
    where.status = statusFilter;
  }

  if (searchQuery) {
    where.OR = [
      { customerName: { contains: searchQuery } },
      { customerEmail: { contains: searchQuery } }
    ];
  }

  // Date filter
  const daysAgo = parseInt(dateRange);
  if (!isNaN(daysAgo)) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    where.startedAt = { gte: startDate };
  }

  // Fetch chats with message counts
  const chats = await prisma.chatSession.findMany({
    where,
    include: {
      _count: {
        select: { messages: true }
      }
    },
    orderBy: { startedAt: 'desc' },
    take: 100
  });

  const chatSummaries: ChatSummary[] = chats.map(chat => ({
    id: chat.id,
    customerName: chat.customerName || 'Anonymous',
    customerEmail: chat.customerEmail || 'N/A',
    startedAt: chat.startedAt.toISOString(),
    endedAt: chat.endedAt?.toISOString() || null,
    status: chat.status,
    messageCount: chat._count.messages,
    aiHandled: chat.aiHandled,
    assignedAgentName: chat.assignedAgentName
  }));

  // Calculate stats
  const totalChats = chatSummaries.length;
  const activeChats = chatSummaries.filter(c => c.status === 'active').length;
  const needsAgent = chatSummaries.filter(c => c.status === 'needs_agent').length;
  const resolved = chatSummaries.filter(c => c.status === 'resolved').length;

  return json({
    chats: chatSummaries,
    stats: {
      total: totalChats,
      active: activeChats,
      needsAgent,
      resolved
    },
    filters: {
      status: statusFilter,
      search: searchQuery,
      dateRange
    }
  });
};

export default function ChatHistoryPage() {
  const { chats, stats, filters } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState(filters.search);
  const [statusFilter, setStatusFilter] = useState<string[]>(
    filters.status === 'all' ? [] : [filters.status]
  );
  const [dateRangeFilter, setDateRangeFilter] = useState<string[]>([filters.dateRange]);

  const handleFiltersQueryChange = (value: string) => {
    setSearchValue(value);
    applyFilters(value, statusFilter, dateRangeFilter);
  };

  const handleStatusFilterChange = (value: string[]) => {
    setStatusFilter(value);
    applyFilters(searchValue, value, dateRangeFilter);
  };

  const handleDateRangeChange = (value: string[]) => {
    setDateRangeFilter(value);
    applyFilters(searchValue, statusFilter, value);
  };

  const applyFilters = (search: string, status: string[], dateRange: string[]) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status.length > 0) params.set('status', status[0]);
    if (dateRange.length > 0) params.set('dateRange', dateRange[0]);
    
    navigate(`/app/chats?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchValue('');
    setStatusFilter([]);
    setDateRangeFilter(['30']);
    navigate('/app/chats');
  };

  const filters_component = [
    {
      key: 'status',
      label: 'Status',
      filter: (
        <ChoiceList
          title="Status"
          titleHidden
          choices={[
            { label: 'Active', value: 'active' },
            { label: 'Needs Agent', value: 'needs_agent' },
            { label: 'Agent Active', value: 'agent_takeover' },
            { label: 'Resolved', value: 'resolved' }
          ]}
          selected={statusFilter}
          onChange={handleStatusFilterChange}
        />
      )
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      filter: (
        <ChoiceList
          title="Date Range"
          titleHidden
          choices={[
            { label: 'Today', value: '1' },
            { label: 'Last 7 days', value: '7' },
            { label: 'Last 30 days', value: '30' },
            { label: 'Last 90 days', value: '90' }
          ]}
          selected={dateRangeFilter}
          onChange={handleDateRangeChange}
        />
      )
    }
  ];

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge>Active</Badge>;
      case 'needs_agent':
        return <Badge tone="attention">Needs Agent</Badge>;
      case 'agent_takeover':
        return <Badge tone="success">Agent Active</Badge>;
      case 'resolved':
        return <Badge tone="info">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const rows = chats.map(chat => [
    chat.customerName,
    chat.customerEmail,
    formatDateTime(chat.startedAt),
    `${chat.messageCount} messages`,
    getStatusBadge(chat.status),
    chat.aiHandled ? '🤖 AI' : chat.assignedAgentName || '👤 Agent',
    <Button onClick={() => navigate(`/app/chats/${chat.id}`)}>
      View
    </Button>
  ]);

  return (
    <>
      <TitleBar title="Chat History" />
      <Page fullWidth>
        {/* Stats Cards */}
        <InlineStack gap="4" wrap={false}>
          <Card>
            <Text variant="headingMd" as="h2">Total Chats</Text>
            <Text variant="heading2xl" as="p">{stats.total}</Text>
          </Card>
          <Card>
            <Text variant="headingMd" as="h2">Active</Text>
            <Text variant="heading2xl" as="p">{stats.active}</Text>
          </Card>
          <Card>
            <Text variant="headingMd" as="h2">Needs Agent</Text>
            <Text variant="heading2xl" as="p" tone="critical">{stats.needsAgent}</Text>
          </Card>
          <Card>
            <Text variant="headingMd" as="h2">Resolved</Text>
            <Text variant="heading2xl" as="p">{stats.resolved}</Text>
          </Card>
        </InlineStack>

        {/* Chats Table */}
        <Card>
          <Filters
            queryValue={searchValue}
            queryPlaceholder="Search by customer name or email"
            filters={filters_component}
            onQueryChange={handleFiltersQueryChange}
            onQueryClear={() => handleFiltersQueryChange('')}
            onClearAll={clearFilters}
          />

          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'text',
              'text',
              'text',
              'text',
              'text'
            ]}
            headings={[
              'Customer',
              'Email',
              'Started',
              'Messages',
              'Status',
              'Handled By',
              'Actions'
            ]}
            rows={rows}
          />

          {chats.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <Text variant="bodyMd" tone="subdued">
                No chat conversations found
              </Text>
            </div>
          )}
        </Card>
      </Page>
    </>
  );
}
