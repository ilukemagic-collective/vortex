import { Suspense } from "react";
import Link from "next/link";
import { getChannels } from "@/lib/supabase/channels";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

async function ChannelList() {
  const channels = await getChannels();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">频道列表</h1>
        <Link href="/channels/new">
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            创建频道
          </Button>
        </Link>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-10 bg-card rounded-lg border p-8">
          <p className="text-muted-foreground">
            暂无频道，创建一个新频道开始交流吧！
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <Link
              key={channel.id}
              href={`/channels/${channel.id}`}
              className="block p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{channel.name}</h3>
                {channel.is_private && (
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    私密
                  </span>
                )}
              </div>
              {channel.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {channel.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChannelsPage() {
  return (
    <div className="container py-10 flex justify-center min-h-[calc(100vh-80px)]">
      <Suspense fallback={<div className="text-center w-full">加载中...</div>}>
        <ChannelList />
      </Suspense>
    </div>
  );
}
