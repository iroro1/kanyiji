declare module '@mailchimp/mailchimp_marketing' {
  interface SetConfigOptions {
    apiKey: string;
    server: string;
  }

  interface AddListMemberOptions {
    email_address: string;
    status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | 'transactional';
    merge_fields?: Record<string, any>;
    tags?: string[];
  }

  interface ListMemberResponse {
    id: string;
    email_address: string;
    status: string;
    merge_fields: Record<string, any>;
    stats: {
      avg_open_rate: number;
      avg_click_rate: number;
    };
    ip_signup: string;
    timestamp_signup: string;
    ip_opt: string;
    timestamp_opt: string;
    member_rating: number;
    last_changed: string;
    language: string;
    vip: boolean;
    email_client: string;
    location: {
      latitude: number;
      longitude: number;
      gmtoff: number;
      dstoff: number;
      country_code: string;
      timezone: string;
      region: string;
    };
    source: string;
    tags_count: number;
    tags: Array<{
      id: number;
      name: string;
    }>;
    list_id: string;
    _links: Array<{
      rel: string;
      href: string;
      method: string;
      targetSchema: string;
      schema: string;
    }>;
  }

  interface MailchimpError {
    status: number;
    response?: {
      body?: {
        title?: string;
        detail?: string;
      };
    };
  }

  const mailchimp: {
    setConfig(options: SetConfigOptions): void;
    lists: {
      addListMember(listId: string, options: AddListMemberOptions): Promise<ListMemberResponse>;
    };
  };

  export default mailchimp;
}

