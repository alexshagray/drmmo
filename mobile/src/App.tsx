import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import DashboardScreen from './screens/DashboardScreen';
import IncidentsScreen from './screens/IncidentsScreen';
import DispatchScreen from './screens/DispatchScreen';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import { UserProvider, useUser } from './context/UserContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#2563eb',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={DashboardScreen}
          options={{
            headerRight: () => (
              <View style={{ marginRight: 15 }}>
                {/* Add logout button here if needed */}
              </View>
            ),
          }}
        />
        <Tab.Screen name="Incidents" component={IncidentsScreen} />
        <Tab.Screen name="Request Form" component={DispatchScreen} />
        <Tab.Screen 
          name="Profile" 
          component={SettingsScreen}
          options={{
            headerRight: () => (
              <View style={{ marginRight: 15 }}>
                {/* Add logout button here if needed */}
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </View>
  );
}

function MainApp() {
  const { isAuthenticated, logout, setUser } = useUser();

  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} initialParams={{ onLogin: (userData: any) => {
          setUser(userData);
        }}} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
      </Stack.Navigator>
    );
  }

  return <MainTabs />;
}

export default function App(): JSX.Element {
  return (
    <UserProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <MainApp />
        </NavigationContainer>
      </SafeAreaProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
