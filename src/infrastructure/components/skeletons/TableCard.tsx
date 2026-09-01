// src/components/tables/AppTableCardSkeleton.tsx
import React, { ReactNode } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
} from "@/infrastructure/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/infrastructure/components/ui/table";
import { Skeleton } from "@/infrastructure/components/ui/skeleton";

interface AppTableCardSkeletonProps {
  children?: ReactNode;
  className?: string;
}

interface HeaderProps {
  title?: string;
  showButton?: boolean;
}

interface ContentProps {
  rows?: number;
  columns?: number;
  showCheckbox?: boolean;
}

interface FooterProps {
  showPagination?: boolean;
}

const AppTableCardSkeleton = ({
  children,
  className = ""
}: AppTableCardSkeletonProps) => {
  return (
    <Card className={className}>
      {children}
    </Card>
  );
};

const Header = ({
  title,
  showButton = false
}: HeaderProps) => {
  return (
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>
        {title ? <Skeleton className="h-6 w-32" /> : null}
      </CardTitle>
      {showButton && <Skeleton className="h-10 w-40" />}
    </CardHeader>
  );
};

const Content = ({
  rows = 5,
  columns = 4,
  showCheckbox = false
}: ContentProps) => {
  const totalColumns = showCheckbox ? columns + 1 : columns;

  return (
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            {showCheckbox && (
              <TableHead>
                <Skeleton className="h-4 w-4" />
              </TableHead>
            )}
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-full" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {showCheckbox && (
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
              )}
              {Array.from({ length: columns }).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
};

const Footer = ({
  showPagination = true
}: FooterProps) => {
  return (
    <CardFooter className="px-8 flex items-center justify-between">
      {showPagination && (
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-24 ml-4" />
        </div>
      )}
    </CardFooter>
  );
};

AppTableCardSkeleton.Header = Header;
AppTableCardSkeleton.Content = Content;
AppTableCardSkeleton.Footer = Footer;

export { AppTableCardSkeleton };
