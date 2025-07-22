
import { MessageReaction } from '@/types/messages';

interface MessageReactionsListProps {
  reactions: MessageReaction[];
  onReact: (emoji: string) => void;
}

export const MessageReactionsList = ({ reactions, onReact }: MessageReactionsListProps) => {
  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = { count: 0, users: [] };
    }
    acc[reaction.emoji].count++;
    acc[reaction.emoji].users.push(reaction.user?.full_name || 'Someone');
    return acc;
  }, {} as Record<string, { count: number; users: string[] }>);

  if (Object.keys(groupedReactions).length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([emoji, data]) => (
        <div
          key={emoji}
          className="bg-muted border rounded-full px-2 py-1 text-xs flex items-center gap-1 cursor-pointer hover:bg-muted/80"
          onClick={() => onReact(emoji)}
          title={`${data.users.join(', ')} reacted with ${emoji}`}
        >
          <span>{emoji}</span>
          <span className="text-muted-foreground">{data.count}</span>
        </div>
      ))}
    </div>
  );
};
