import { useEffect, useState } from 'react';
import {
  ArrowLeftIcon,
  Button,
  Flex,
  Header,
  Loader,
} from '@fluentui/react-northstar';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import * as microsoftTeams from '@microsoft/teams-js';
import { getSupportDepartment, getSupportDepartmentItem } from 'api';
import { CustomerInquiryDetail } from 'components/CustomerInquiryDetail';
import { CustomerInquiry, SupportDepartment } from 'models';

function InquirySubEntityTab() {
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  const params = useParams();
  const entityId: string = params.entityId ?? 'unknown';
  const subEntityId: string = params.subEntityId ?? 'unknown';

  useEffect(() => {
    // When we navigate away, close the chat.
    return () => closeConversation()
  }, [])

  const inquiry = useQuery<CustomerInquiry, Error>(
    ['getSupportDepartmentItem', { entityId }, { subEntityId }],
    () => getSupportDepartmentItem(entityId, subEntityId),
  );

  const supportDepartment = useQuery<SupportDepartment, Error>(
    ['getSupportDepartment', { entityId }],
    () => getSupportDepartment(entityId),
  );

  const openConversation = () => {
    if (inquiry.data && supportDepartment.data) {
      microsoftTeams.conversations.openConversation({
        entityId: supportDepartment.data.supportDepartmentId,
        subEntityId: inquiry.data.subEntityId,
        channelId:
          supportDepartment.data.teamChannelId,
        title: inquiry.data.question,
        conversationId: inquiry.data.conversationId,
      });
      setIsChatOpen(true);
    }
  };

  const closeConversation = () => {
    microsoftTeams.conversations.closeConversation();
    setIsChatOpen(false);
  };

  return (
    <Flex column>
      <Flex>
        <Button
          tabIndex={-1}
          icon={<ArrowLeftIcon />}
          secondary
          content="Back"
          onClick={() => navigate(-1)}
        />
      </Flex>
      {inquiry.isLoading && supportDepartment.isLoading && <Loader />}
      {inquiry.error && supportDepartment.error && (
        <Header content={inquiry.error.message} />
      )}
      {inquiry.data && supportDepartment.data && (
        <CustomerInquiryDetail
          customerInquiry={inquiry.data}
          isChatOpen={isChatOpen}
          onOpenConversation={openConversation}
          onCloseConversation={closeConversation}
        />
      )}
    </Flex>
  );
}

export { InquirySubEntityTab };