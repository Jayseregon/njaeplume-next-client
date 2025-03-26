import React, { JSX } from "react";
import {
  CircleUserRound,
  LayoutDashboard,
  Mail,
  UserRound,
} from "lucide-react";
import {
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";

import { getCastleNavItemByKey, getSubItemByKey } from "@/config/site";
import { Button } from "@/components/ui/button";

export const UserLogin = ({ nonce }: { nonce?: string }): JSX.Element => {
  const { isSignedIn, user } = useUser();
  const castleItem = getCastleNavItemByKey("castle");
  const contactItem = getSubItemByKey("contact");
  const accountItem = getSubItemByKey("account");

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
                  label={castleItem.label}
                  labelIcon={<LayoutDashboard />}
                />
              </UserButton.MenuItems>
            )}
          {isSignedIn && accountItem && (
            <UserButton.MenuItems>
              <UserButton.Link
                href={accountItem.href}
                label={accountItem.label}
                labelIcon={<UserRound />}
              />
            </UserButton.MenuItems>
          )}
          <UserButton.MenuItems>
            <UserButton.Link
              href={contactItem.href}
              label={contactItem.label}
              labelIcon={<Mail />}
            />
          </UserButton.MenuItems>
        </UserButton>
      </SignedIn>
    </>
  );
};
