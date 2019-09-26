import { createAppContainer} from 'react-navigation';
import { Header, createStackNavigator} from 'react-navigation-stack';
import { createDrawerNavigator, DrawerNavigatorItems} from 'react-navigation-drawer';
import React from 'react';
import { View, Text, ScrollView, Image, Dimensions, StatusBar, TouchableOpacity, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeScreen from './screens/Home';
import AddExpScreen from './screens/AddExp';
import HistoryScreen from './screens/History';
import SettingsScreen from './screens/Settings';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height - Header.HEIGHT - StatusBar.currentHeight;

const Stack = createStackNavigator({
    Home: {
      screen: HomeScreen,
    },
    AddExp:{
      screen: AddExpScreen,
    },
    History: {
      screen: HistoryScreen
    },
    Settings: {
      screen: SettingsScreen
    }
}, {
    defaultNavigationOptions: {
        headerTintColor: 'white',
        headerStyle: {
            backgroundColor: '#11cc36',
            elevation: 1
        }
    }
});

const Draw = createDrawerNavigator({
    Home: {
      screen: Stack,
      navigationOptions: {
        drawerIcon: () => (<Icon name="home" size={26} color = '#888' />)
      }
    },
    History: {
      screen: HistoryScreen,
      navigationOptions: {
        drawerIcon: () => (<Icon name="history" size={26} />)
      }
    },
    Settings: {
      screen: SettingsScreen,
      navigationOptions: {
        drawerIcon: () => (<Icon name="settings" size={26} />)
      }
    }
},{
    drawerWidth: width * 0.8,
    contentComponent:
      props => (
        <ScrollView>
          <View style={{ height: height * 0.28, alignItems: 'center', justifyContent: 'center' }}>
            <Image
              source={require('./assets/draw.png')}
              style={{ width: width * 0.8, height: height * 0.28 }}
            />
          </View>
          <DrawerNavigatorItems {...props} />
          <TouchableOpacity
            style={{ paddingLeft: 17, paddingBottom: 13, paddingTop: 10 }}
            onPress={() => { Linking.openURL("mailto:ibraberatkaya@gmail.com?subject=Feedback"); }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="email" size={24} color="#aaa" />
              <Text style={{ fontSize: 14, fontWeight: 'bold', paddingLeft: 32, color: 'black' }}>Feedback</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingLeft: 17, paddingVertical: 14.5 }}
            onPress={() => { Linking.openURL("https://play.google.com/store/apps/details?id=com.kaya.expense"); }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="star" size={24} color="#aaa" />
              <Text style={{ fontSize: 14, fontWeight: 'bold', paddingLeft: 32, color: 'black' }}>Rate App</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ paddingLeft: 17, paddingVertical: 14.5 }}
            onPress={() => { Linking.openURL("https://play.google.com/store/apps/developer?id=IBK+Apps"); }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="google-play" size={24} color="#aaa" />
              <Text style={{ fontSize: 14, fontWeight: 'bold', paddingLeft: 32, color: 'black' }}>View Other Apps</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      )
});


Stack.navigationOptions = ({ navigation }) => {
    name = (navigation.state.index !== undefined ? navigation.state.routes[navigation.state.index] : navigation.state.routeName)
    let drawerLockMode = 'locked-closed'
    if (name.routeName == 'Home') {
      drawerLockMode = 'unlocked'
    }
    return {
      drawerLockMode,
    };
  }

export default createAppContainer(Draw);