"use client";

import { Card, CardBody } from "@nextui-org/react";

interface PageTmpCardProps {
  subtitle: string;
}

export const PageTmpCard: React.FC<PageTmpCardProps> = ({ subtitle }) => {
  return (
    <>
      <Card className="bg-secondary-200" shadow="lg">
        <CardBody className="p-9">
          <p>{subtitle}</p>
        </CardBody>
      </Card>
    </>
  );
};
