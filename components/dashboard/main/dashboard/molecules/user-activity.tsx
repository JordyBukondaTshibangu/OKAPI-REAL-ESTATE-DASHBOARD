"use client";
import dayjs from "dayjs";
import { ChevronRight, EllipsisIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import AnimatedLoader from "@/components/feedback/atoms/animated-loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { PAGE_SIZE } from "@/constants";
import { AppDispatch, RootState } from "@/store";
import { getAdminAuditLogs } from "@/store/features/admin/audit/slice";

function UserActivity() {
  const dispatch = useDispatch<AppDispatch>();

  const [loading, setLoading] = useState<boolean>(true);

  const { items: auditLogs } = useSelector((state: RootState) => {
    return state.auditLogs["adminAuditLogs"];
  });

  const fetchAuditLogs = useCallback(async () => {
    try {
      await dispatch(
        getAdminAuditLogs({
          page: 1,
          pageSize: PAGE_SIZE,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  return (
    <Card className="border rounded-2xl shadow-sm col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin Activities</CardTitle>
        <span className="w-8 h-8 items-center justify-center hidden">
          <EllipsisIcon className="w-4 h-4" />
        </span>
      </CardHeader>
      <>
        {loading ? (
          <div className="min-h-31 flex items-center justify-center">
            <AnimatedLoader />
          </div>
        ) : (
          <CardContent className="min-h-31 flex items-center justify-center text-sm text-foreground">
            {auditLogs && auditLogs?.length > 0 ? (
              <div className="w-full flex flex-col gap-4">
                {auditLogs.slice(0, 4).map((log, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs leading-normal font-normal text-neutral-500">
                      {dayjs(log.time).format("hh:mm A")}
                    </span>
                    <p className="text-xs leading-normal font-normal text-foreground">
                      {log.activity}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              "No activity found"
            )}
          </CardContent>
        )}
      </>

      <Link href="/dashboard/reports/audit-logs" className="px-6">
        <Button variant="ghost" className="px-0 gradient-text">
          View All Activities
          <ChevronRight className="w-4 h-4 text-primary" />
        </Button>
      </Link>
    </Card>
  );
}

export default UserActivity;
