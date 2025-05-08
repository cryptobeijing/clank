import { Configuration, NeynarAPIClient } from "@neynar/nodejs-sdk";
import { CastWithInteractions, FilterType } from "@neynar/nodejs-sdk/build/api";
import { NextResponse } from "next/server";

const CLANKER_FID = 337685; // Clanker's FID

const castToPost = (cast: CastWithInteractions) => {
    return {
        id: cast.hash,
        text: cast.text,
        embeds: cast.embeds,
        timestamp: cast.timestamp,
        author: cast.author,
        reactions: cast.reactions,
        replies: cast.replies,
    }
}

// Common Farcaster channel IDs
const CHANNEL_IDS: { [key: string]: string } = {
  'farcaster': 'farcaster',
  'base': 'base',
  'warpcast': 'warpcast',
  'dwr': 'dwr',
  'farcaster-news': 'farcaster-news',
  'farcaster-dev': 'farcaster-dev',
  'farcaster-community': 'farcaster-community',
  'farcaster-announcements': 'farcaster-announcements',
  'farcaster-help': 'farcaster-help',
  'farcaster-feedback': 'farcaster-feedback',
  'farcaster-bugs': 'farcaster-bugs',
  'farcaster-features': 'farcaster-features',
  'farcaster-ideas': 'farcaster-ideas',
  'farcaster-discussion': 'farcaster-discussion',
  'farcaster-general': 'farcaster-general',
  'farcaster-offtopic': 'farcaster-offtopic',
  'farcaster-memes': 'farcaster-memes',
  'farcaster-art': 'farcaster-art',
  'farcaster-music': 'farcaster-music',
  'farcaster-gaming': 'farcaster-gaming',
  'farcaster-tech': 'farcaster-tech',
  'farcaster-crypto': 'farcaster-crypto',
  'farcaster-defi': 'farcaster-defi',
  'farcaster-nft': 'farcaster-nft',
  'farcaster-dao': 'farcaster-dao',
  'farcaster-governance': 'farcaster-governance',
  'farcaster-events': 'farcaster-events',
  'farcaster-jobs': 'farcaster-jobs',
  'farcaster-opportunities': 'farcaster-opportunities',
  'farcaster-education': 'farcaster-education',
  'farcaster-resources': 'farcaster-resources',
  'farcaster-tools': 'farcaster-tools',
  'farcaster-projects': 'farcaster-projects',
  'farcaster-showcase': 'farcaster-showcase',
  'farcaster-achievements': 'farcaster-achievements',
  'farcaster-milestones': 'farcaster-milestones',
  'farcaster-updates': 'farcaster-updates',
  'farcaster-changes': 'farcaster-changes',
  'farcaster-improvements': 'farcaster-improvements',
  'farcaster-fixes': 'farcaster-fixes',
  'farcaster-optimizations': 'farcaster-optimizations',
  'farcaster-enhancements': 'farcaster-enhancements',
  'farcaster-suggestions': 'farcaster-suggestions',
  'farcaster-requests': 'farcaster-requests',
  'farcaster-issues': 'farcaster-issues',
  'farcaster-problems': 'farcaster-problems',
  'farcaster-solutions': 'farcaster-solutions',
  'farcaster-workarounds': 'farcaster-workarounds',
  'farcaster-tips': 'farcaster-tips',
  'farcaster-tricks': 'farcaster-tricks',
  'farcaster-hacks': 'farcaster-hacks',
  'farcaster-shortcuts': 'farcaster-shortcuts',
  'farcaster-best-practices': 'farcaster-best-practices',
  'farcaster-guidelines': 'farcaster-guidelines',
  'farcaster-standards': 'farcaster-standards',
  'farcaster-conventions': 'farcaster-conventions',
  'farcaster-patterns': 'farcaster-patterns',
  'farcaster-architecture': 'farcaster-architecture',
  'farcaster-design': 'farcaster-design',
  'farcaster-ux': 'farcaster-ux',
  'farcaster-ui': 'farcaster-ui',
  'farcaster-frontend': 'farcaster-frontend',
  'farcaster-backend': 'farcaster-backend',
  'farcaster-fullstack': 'farcaster-fullstack',
  'farcaster-mobile': 'farcaster-mobile',
  'farcaster-web': 'farcaster-web',
  'farcaster-desktop': 'farcaster-desktop',
  'farcaster-cli': 'farcaster-cli',
  'farcaster-api': 'farcaster-api',
  'farcaster-sdk': 'farcaster-sdk',
  'farcaster-libraries': 'farcaster-libraries',
  'farcaster-frameworks': 'farcaster-frameworks',
  'farcaster-services': 'farcaster-services',
  'farcaster-platforms': 'farcaster-platforms',
  'farcaster-infrastructure': 'farcaster-infrastructure',
  'farcaster-deployment': 'farcaster-deployment',
  'farcaster-hosting': 'farcaster-hosting',
  'farcaster-cloud': 'farcaster-cloud',
  'farcaster-serverless': 'farcaster-serverless',
  'farcaster-microservices': 'farcaster-microservices',
  'farcaster-monolith': 'farcaster-monolith',
  'farcaster-distributed': 'farcaster-distributed',
  'farcaster-decentralized': 'farcaster-decentralized',
  'farcaster-centralized': 'farcaster-centralized',
  'farcaster-hybrid': 'farcaster-hybrid'
};

export async function GET(request: Request) {
  const neynarApiKey = process.env.NEXT_NEYNAR_API_KEY;

  if (!neynarApiKey) {
    console.warn('No Neynar API key found');
    return NextResponse.json(
      { error: 'No Neynar API key found' },
      { status: 500 }
    );
  }

  try {
    const neynarClient = new NeynarAPIClient(new Configuration({
      apiKey: neynarApiKey
    }));

    // Search for posts mentioning @clanker and deploy
    const searchResults = await neynarClient.searchCasts({
      q: "@clanker deploy",
      limit: 50
    });

    // Get Clanker's own posts about deployment
    const clankerCasts = await neynarClient.searchCasts({
      q: `from:${CLANKER_FID} deploy`,
      limit: 50
    });

    // Combine and filter posts
    const allPosts = [
      ...searchResults.result.casts,
      ...clankerCasts.result.casts
    ].filter(cast => {
      // Keep Clanker's posts about deployment
      if (cast.author.fid === CLANKER_FID && cast.text.toLowerCase().includes('deploy')) return true;
      
      // Keep posts that mention both @clanker and deploy
      const mentionsClanker = cast.text.toLowerCase().includes('@clanker');
      const mentionsDeploy = cast.text.toLowerCase().includes('deploy');
      return mentionsClanker && mentionsDeploy;
    });

    // Sort by timestamp and take the most recent ones
    const sortedPosts = allPosts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);

    return NextResponse.json({ 
      posts: sortedPosts.map(castToPost),
      next: null
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}