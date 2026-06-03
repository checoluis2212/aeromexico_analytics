import { redirect } from 'next/navigation';
import { ADMIN_AGENT_PATH } from '@/lib/ai/agent-scope';

export default function CommandCenterDiscoveryRedirect() {
  redirect(ADMIN_AGENT_PATH);
}
