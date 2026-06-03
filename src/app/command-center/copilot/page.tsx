import { redirect } from 'next/navigation';
import { ADMIN_AGENT_PATH } from '@/lib/ai/agent-scope';

export default function CommandCenterCopilotRedirect() {
  redirect(ADMIN_AGENT_PATH);
}
