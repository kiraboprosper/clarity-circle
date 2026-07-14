"use client";

import { useState } from "react";
import type { UserProfile } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Input";

export function CreatePost({ profile, onCreatePost }: { profile: UserProfile, onCreatePost: (content: string) => Promise<void> }) {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    await onCreatePost(content);
    setContent("");
    setIsPosting(false);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar src={profile.photoURL} name={profile.displayName} />
        <div className="w-full">
          <Textarea
            placeholder={`What's on your mind, ${profile.displayName}?`}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button onClick={handlePost} loading={isPosting}>Post</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}