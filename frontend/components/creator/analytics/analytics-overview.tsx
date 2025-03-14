"use client"

import { useCreatorTools } from "@/providers/creator-tools-provider"
import { useEffect, useState } from "react"
import { subDays } from "date-fns"
import type { DateRange } from "react-day-picker"
import { toast } from "@/components/ui/use-toast"

export function AnalyticsOverview() {
  const {
    postAnalytics,
    audienceDemographics,
    growthTrends,
    loadingAnalytics,
    fetchPostAnalytics,
    fetchAudienceDemographics,
    fetchGrowthTrends,
  } = useCreatorTools();
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const period = dateRange.from && dateRange.to
          ? {
              start: dateRange.from,
              end: dateRange.to,
            }
          : undefined;
        
        await Promise.all([
          fetchPostAnalytics(period),
          fetchAudienceDemographics(),
          fetchGrowthTrends(period),
        ]);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [
    dateRange,
    fetchPostAnalytics,
    fetchAudienceDemographics,
    fetchGrowthTrends,
  ]);
  
  const handleRefresh = () => {
    const period = dateRange.from && dateRange.to
      ? {
          start: dateRange.from,
          end: dateRange.to,
        }
      : undefined;
    
    fetchPostAnalytics(period);
    fetchAudienceDemographics();
    fetchGrowthTrends(period);
  };

