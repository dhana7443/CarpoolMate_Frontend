// AdminAnalyticsScreen.js
import React, { useEffect, useState } from "react";
import { View, ScrollView, Dimensions, StyleSheet } from "react-native";
import { Card, Text, ActivityIndicator } from "react-native-paper";
import { PieChart } from "react-native-chart-kit";
import { getAnalytics } from "../src/api/analytics";

const screenWidth = Dimensions.get("window").width;

const AdminAnalyticsScreen=()=> {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error("fetch analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating={true} size={48} />
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.center}>
        <Text variant="bodyMedium">No data available</Text>
      </View>
    );
  }

  const pieData = [
    { name: "Active", population: analytics.users.activeUsers || 0, color: "#4CAF50", legendFontColor: "#333", legendFontSize: 12 },
    { name: "Blocked", population: analytics.users.blockedUsers || 0, color: "#F44336", legendFontColor: "#333", legendFontSize: 12 },
    { name: "Drivers", population: analytics.users.drivers || 0, color: "#2196F3", legendFontColor: "#333", legendFontSize: 12 },
    { name: "Passengers", population: analytics.users.passengers || 0, color: "#FFC107", legendFontColor: "#333", legendFontSize: 12 },
  ].filter(d => d.population > 0); // optional: hide zero slices

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Users</Text>
          <Text variant="bodyMedium">Total: {analytics.users.totalUsers}</Text>
          <Text variant="bodyMedium">Active: {analytics.users.activeUsers}</Text>
          <Text variant="bodyMedium">Blocked: {analytics.users.blockedUsers}</Text>
          <Text variant="bodyMedium">Drivers: {analytics.users.drivers}</Text>
          <Text variant="bodyMedium">Passengers: {analytics.users.passengers}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Rides</Text>
          <Text variant="bodyMedium">Total: {analytics.rides.totalRides}</Text>
          <Text variant="bodyMedium">Active: {analytics.rides.activeRides}</Text>
          <Text variant="bodyMedium">Completed: {analytics.rides.completedRides}</Text>
          <Text variant="bodyMedium">Cancelled: {analytics.rides.cancelledRides}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>Reports</Text>
          <Text variant="bodyMedium">Open: {analytics.reports.openReports}</Text>
          <Text variant="bodyMedium">Resolved: {analytics.reports.resolvedReports}</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>User Distribution</Text>
          <PieChart
            data={pieData}
            width={screenWidth - 30}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
              labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

export default AdminAnalyticsScreen;

const styles = StyleSheet.create({
  container: { padding: 12, paddingBottom: 30 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  card: { marginBottom: 12 },
  cardTitle: { marginBottom: 8 },
});
