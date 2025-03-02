"use client";

import { useState } from "react";
import { transferChannelOwnership } from "@/lib/supabase/channels";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertTriangle, Crown, Loader2, ShieldAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChannelMember } from "@/types/channel";

interface TransferOwnershipDialogProps {
  channelId: string;
  channelName: string;
  currentOwnerId: string;
  members: ChannelMember[];
  onSuccess?: () => void;
}

export function TransferOwnershipDialog({
  channelId,
  channelName,
  currentOwnerId,
  members,
  onSuccess,
}: TransferOwnershipDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");

  // 过滤出可以转让所有权的成员（非所有者）
  const eligibleMembers = members.filter(
    (member) => member.user_id !== currentOwnerId
  );

  async function handleTransfer() {
    if (!selectedMemberId) {
      toast.error("请选择要转让所有权的成员");
      return;
    }

    const selectedMember = members.find((m) => m.user_id === selectedMemberId);
    if (!selectedMember) return;

    try {
      setIsSubmitting(true);
      await transferChannelOwnership(
        channelId,
        selectedMemberId,
        currentOwnerId
      );

      toast.success(
        `已成功将频道 "${channelName}" 的所有权转让给 ${selectedMember.user?.username}`
      );

      setIsOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("转让所有权失败:", error);

      toast.error("无法转让频道所有权，请稍后再试");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Crown className="h-4 w-4" />
          转让所有权
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>转让频道所有权</DialogTitle>
          <DialogDescription>
            将频道 "{channelName}" 的所有权转让给另一位成员
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-amber-50 dark:bg-amber-950/50 p-3 rounded-lg flex items-start gap-2 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium">注意</p>
              <p className="mt-1">
                转让所有权后，你将变成频道管理员，无法撤销此操作。
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              选择新所有者
            </label>
            <Select
              onValueChange={setSelectedMemberId}
              value={selectedMemberId}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择一位成员" />
              </SelectTrigger>
              <SelectContent>
                {eligibleMembers.length > 0 ? (
                  eligibleMembers.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={member.user?.avatar_url || undefined}
                          />
                          <AvatarFallback>
                            {member.user?.username?.charAt(0).toUpperCase() ||
                              "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.user?.username}</span>
                        {member.role === "admin" && (
                          <ShieldAlert className="h-4 w-4 text-muted-foreground ml-1" />
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    没有可选的成员
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={
              isSubmitting || !selectedMemberId || eligibleMembers.length === 0
            }
            variant="default"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                转让中...
              </>
            ) : (
              "确认转让"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
