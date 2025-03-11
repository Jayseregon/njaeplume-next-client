import React, { JSX } from "react";
import { CircleUserRound, LayoutDashboard } from "lucide-react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import { getCastleNavItemByKey } from "@/config/site";
import { Button } from "@/components/ui/button";

export const UserLogin = ({ nonce }: { nonce?: string }): JSX.Element => {
  const { isSignedIn, user } = useUser();
  const castleItem = getCastleNavItemByKey("castle");

  return (
    <>
      <SignedOut>
        <SignInButton fallbackRedirectUrl="/" forceRedirectUrl="/">
          <Button
            aria-label="User login"
            nonce={nonce}
            size="icon"
            variant={"ghost"}
          >
            <CircleUserRound />
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              userButtonBox: {
                padding: 1,
              },
            },
          }}
        >
          {isSignedIn &&
            user?.publicMetadata?.role === "castleAdmin" &&
            castleItem && (
              <UserButton.MenuItems>
                <UserButton.Link
                  href={castleItem.href}
                  label="Castle"
                  labelIcon={<LayoutDashboard />}
                />
              </UserButton.MenuItems>
            )}
        </UserButton>
      </SignedIn>
    </>
  );
};
