'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  is_internal?: boolean;
  user_id?: string | null;
}

interface CommentThreadProps {
  requestId: string;
  initialComments: Comment[];
  currentUserId?: string;
  canPostInternal?: boolean;
}

export function CommentThread({
  requestId,
  initialComments,
  currentUserId,
  canPostInternal = false,
}: CommentThreadProps) {
  const [comments, setComments] = useState(initialComments);
  const [content, setContent] = useState('');
  const [internal, setInternal] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSending(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), is_internal: internal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error');

      setComments((prev) => [...prev, data]);
      setContent('');
      toast.success('Mensaje enviado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Conversación</h3>
        <span className="text-xs text-muted-foreground">({comments.length})</span>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sin mensajes aún. Escribe abajo para preguntar o dar contexto.
          </p>
        ) : (
          comments.map((c) => {
            const mine = currentUserId && c.user_id === currentUserId;
            return (
              <div
                key={c.id}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm max-w-[90%]',
                  mine
                    ? 'ml-auto bg-primary/15 border border-primary/20'
                    : 'bg-secondary/40 border border-border/40',
                  c.is_internal && 'border-dashed border-signal/40 bg-signal/5'
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-medium">{c.author_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: es })}
                  </span>
                </div>
                {c.is_internal && (
                  <span className="text-[10px] text-signal block mb-1">Nota interna</span>
                )}
                <p className="leading-relaxed whitespace-pre-wrap">{c.content}</p>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 pt-2 border-t border-border/40">
        <Textarea
          placeholder="Escribe un mensaje…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          className="resize-none text-sm"
        />
        <div className="flex items-center justify-between gap-2">
          {canPostInternal && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={internal}
                onChange={(e) => setInternal(e.target.checked)}
                className="rounded"
              />
              Solo interno
            </label>
          )}
          <Button type="submit" size="sm" disabled={sending || !content.trim()} className="ml-auto">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
            Enviar
          </Button>
        </div>
      </form>
    </div>
  );
}
