import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Heart, Repeat2, Send, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { formatEther, parseEther, isAddress } from "viem";
import { useAccount, useSendTransaction, useWaitForTransactionReceipt, useBalance } from "wagmi";
import { formatDate } from "../lib/utils";

export interface Post {
  id: string;
  author: {
    name: string;
    display_name: string;
    username: string;
    pfp_url: string;
    power_badge: boolean;
    custody_address: `0x${string}`;
    verified_addresses: {
      eth_addresses: `0x${string}`[];
      sol_addresses: string[];
    };
  };
  embeds: {
    metadata: {
      content_type: string;
    };
    url: string;
  }[];
  text: string;
  timestamp: string;
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies: {
    count: number;
  };
}

interface PostsResponse {
  posts: Post[];
  channelId?: string;
}

const AVAILABLE_CHANNELS = [
  { name: 'Farcaster', id: 'farcaster' },
  { name: 'Base', id: 'base' },
  { name: 'Warpcast', id: 'warpcast' },
  { name: 'DWR', id: 'dwr' },
  { name: 'Farcaster News', id: 'farcaster-news' },
  { name: 'Farcaster Dev', id: 'farcaster-dev' },
  { name: 'Farcaster Community', id: 'farcaster-community' },
  { name: 'Farcaster Announcements', id: 'farcaster-announcements' },
  { name: 'Farcaster Help', id: 'farcaster-help' },
  { name: 'Farcaster Feedback', id: 'farcaster-feedback' },
  { name: 'Farcaster Bugs', id: 'farcaster-bugs' },
  { name: 'Farcaster Features', id: 'farcaster-features' },
  { name: 'Farcaster Ideas', id: 'farcaster-ideas' },
  { name: 'Farcaster Discussion', id: 'farcaster-discussion' },
  { name: 'Farcaster General', id: 'farcaster-general' },
  { name: 'Farcaster Offtopic', id: 'farcaster-offtopic' },
  { name: 'Farcaster Memes', id: 'farcaster-memes' },
  { name: 'Farcaster Art', id: 'farcaster-art' },
  { name: 'Farcaster Music', id: 'farcaster-music' },
  { name: 'Farcaster Gaming', id: 'farcaster-gaming' },
  { name: 'Farcaster Tech', id: 'farcaster-tech' },
  { name: 'Farcaster Crypto', id: 'farcaster-crypto' },
  { name: 'Farcaster DeFi', id: 'farcaster-defi' },
  { name: 'Farcaster NFT', id: 'farcaster-nft' },
  { name: 'Farcaster DAO', id: 'farcaster-dao' },
  { name: 'Farcaster Governance', id: 'farcaster-governance' },
  { name: 'Farcaster Events', id: 'farcaster-events' },
  { name: 'Farcaster Jobs', id: 'farcaster-jobs' },
  { name: 'Farcaster Opportunities', id: 'farcaster-opportunities' },
  { name: 'Farcaster Education', id: 'farcaster-education' },
  { name: 'Farcaster Resources', id: 'farcaster-resources' },
  { name: 'Farcaster Tools', id: 'farcaster-tools' },
  { name: 'Farcaster Projects', id: 'farcaster-projects' },
  { name: 'Farcaster Showcase', id: 'farcaster-showcase' },
  { name: 'Farcaster Achievements', id: 'farcaster-achievements' },
  { name: 'Farcaster Milestones', id: 'farcaster-milestones' },
  { name: 'Farcaster Updates', id: 'farcaster-updates' },
  { name: 'Farcaster Changes', id: 'farcaster-changes' },
  { name: 'Farcaster Improvements', id: 'farcaster-improvements' },
  { name: 'Farcaster Fixes', id: 'farcaster-fixes' },
  { name: 'Farcaster Optimizations', id: 'farcaster-optimizations' },
  { name: 'Farcaster Enhancements', id: 'farcaster-enhancements' },
  { name: 'Farcaster Suggestions', id: 'farcaster-suggestions' },
  { name: 'Farcaster Requests', id: 'farcaster-requests' },
  { name: 'Farcaster Issues', id: 'farcaster-issues' },
  { name: 'Farcaster Problems', id: 'farcaster-problems' },
  { name: 'Farcaster Solutions', id: 'farcaster-solutions' },
  { name: 'Farcaster Workarounds', id: 'farcaster-workarounds' },
  { name: 'Farcaster Tips', id: 'farcaster-tips' },
  { name: 'Farcaster Tricks', id: 'farcaster-tricks' },
  { name: 'Farcaster Hacks', id: 'farcaster-hacks' },
  { name: 'Farcaster Shortcuts', id: 'farcaster-shortcuts' },
  { name: 'Farcaster Best Practices', id: 'farcaster-best-practices' },
  { name: 'Farcaster Guidelines', id: 'farcaster-guidelines' },
  { name: 'Farcaster Standards', id: 'farcaster-standards' },
  { name: 'Farcaster Conventions', id: 'farcaster-conventions' },
  { name: 'Farcaster Patterns', id: 'farcaster-patterns' },
  { name: 'Farcaster Architecture', id: 'farcaster-architecture' },
  { name: 'Farcaster Design', id: 'farcaster-design' },
  { name: 'Farcaster UX', id: 'farcaster-ux' },
  { name: 'Farcaster UI', id: 'farcaster-ui' },
  { name: 'Farcaster Frontend', id: 'farcaster-frontend' },
  { name: 'Farcaster Backend', id: 'farcaster-backend' },
  { name: 'Farcaster Fullstack', id: 'farcaster-fullstack' },
  { name: 'Farcaster Mobile', id: 'farcaster-mobile' },
  { name: 'Farcaster Web', id: 'farcaster-web' },
  { name: 'Farcaster Desktop', id: 'farcaster-desktop' },
  { name: 'Farcaster CLI', id: 'farcaster-cli' },
  { name: 'Farcaster API', id: 'farcaster-api' },
  { name: 'Farcaster SDK', id: 'farcaster-sdk' },
  { name: 'Farcaster Libraries', id: 'farcaster-libraries' },
  { name: 'Farcaster Frameworks', id: 'farcaster-frameworks' },
  { name: 'Farcaster Services', id: 'farcaster-services' },
  { name: 'Farcaster Platforms', id: 'farcaster-platforms' },
  { name: 'Farcaster Infrastructure', id: 'farcaster-infrastructure' },
  { name: 'Farcaster Deployment', id: 'farcaster-deployment' },
  { name: 'Farcaster Hosting', id: 'farcaster-hosting' },
  { name: 'Farcaster Cloud', id: 'farcaster-cloud' },
  { name: 'Farcaster Serverless', id: 'farcaster-serverless' },
  { name: 'Farcaster Microservices', id: 'farcaster-microservices' },
  { name: 'Farcaster Monolith', id: 'farcaster-monolith' },
  { name: 'Farcaster Distributed', id: 'farcaster-distributed' },
  { name: 'Farcaster Decentralized', id: 'farcaster-decentralized' },
  { name: 'Farcaster Centralized', id: 'farcaster-centralized' },
  { name: 'Farcaster Hybrid', id: 'farcaster-hybrid' }
];

const fetchPosts = async (channelName?: string): Promise<PostsResponse> => {
  const url = channelName ? `/api/posts?channelName=${encodeURIComponent(channelName)}` : "/api/posts";
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }
  return response.json();
};

export default function Posts({ onTipSuccess }: { onTipSuccess: () => void }) {
  const { data, isLoading, error } = useQuery<PostsResponse>({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">Error loading posts</div>
    );
  }

  return (
    <div className="space-y-4">
      {data?.posts.map((post) => (
        <PostCard key={post.id} post={post} onTipSuccess={onTipSuccess} />
      ))}
    </div>
  );
}

function PostCard({
  post,
  onTipSuccess,
}: {
  post: Post;
  onTipSuccess: () => void;
}) {
  const account = useAccount();
  const { data: balance } = useBalance({
    address: account.address,
  });
  const {
    sendTransaction,
    data: hash,
    isPending: isTransactionPending,
    reset: resetTransaction,
  } = useSendTransaction();
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });
  const [toastId, setToastId] = useState<string | number | null>(null);

  const handleTip = useCallback(async () => {
    sendTransaction({
      to: post.author.verified_addresses.eth_addresses[0],
      value: parseEther("0.0001"),
    });

    const toastId_ = toast("Sending tip...", {
      description: `Tipping @${post.author.username} with 0.0001 ETH`,
      duration: Infinity,
    });

    setToastId(toastId_);
  }, [post.author, sendTransaction]);

  useEffect(() => {
    if (isConfirmed && toastId !== null) {
      toast.success("Tip sent successfully!", {
        description: `You tipped @${post.author.username} with 0.0001 ETH`,
        duration: 2000,
      });

      setTimeout(() => {
        toast.dismiss(toastId);
      }, 0);

      setToastId(null);
      resetTransaction();
      onTipSuccess();
    }
  }, [
    isConfirmed,
    toastId,
    post.author,
    resetTransaction,
    onTipSuccess,
    setToastId
  ]);

  return (
    <div className="border rounded-lg p-4 bg-black/50 border-purple-500/20 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-purple-500/20">
            <AvatarImage
              src={post.author.pfp_url}
              alt={post.author.display_name}
            />
            <AvatarFallback className="bg-purple-900/20 text-purple-300">
              {post.author.display_name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-purple-300">{post.author.display_name}</div>
            <div className="text-sm text-purple-300/70">
              @{post.author.username} · {formatDate(post.timestamp)}
            </div>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 text-purple-300 hover:bg-purple-900/20" asChild>
          <a
            href={`https://warpcast.com/~/conversations/${post.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <div className="mb-3 whitespace-pre-wrap text-purple-200">{post.text}</div>

      <div className="flex items-center justify-between pt-2 border-t border-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-purple-300/70">
            <Heart className="h-4 w-4" />
            <span>{post.reactions.likes_count}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-purple-300/70">
            <Repeat2 className="h-4 w-4" />
            <span>{post.reactions.recasts_count}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
            disabled={
              !account.address || isConfirming || isTransactionPending
            }
            onClick={handleTip}
          >
            <Send className="h-4 w-4" />
            <span>Clank 0.0001 ETH</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
