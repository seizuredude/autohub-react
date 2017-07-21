import React, { Component } from 'react';
import { ActivityIndicator, ListView, Text, View, Image, StyleSheet, Dimensions, TouchableOpacity, AppRegistry, WebView } from 'react-native';
import { Font } from 'expo';
import _ from 'lodash';
import { StackNavigator } from 'react-navigation';

var styles = StyleSheet.create({
  makeImage: {
    flex: 1,
    width: Dimensions.get('window').width / 4,
    height: Dimensions.get('window').width / 4,
    resizeMode: 'contain'
  },
  makeImageContainer: {
    flex: 1,
    width: Dimensions.get('window').width / 3.25,
    height: Dimensions.get('window').width / 3.9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  makeText: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'MavenProRegular',
    fontSize: 17
  },
  makeList: {
    backgroundColor:'#ffffff',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  makeCell: {
    margin: ((Dimensions.get('window').width) - 3*(Dimensions.get('window').width / 3.25) - 12) / 6,
    justifyContent:'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d6d7da'
  },

  modelList: {
    backgroundColor:'#ffffff',
    flexDirection: 'column'
  },
  modelImage: {
    flex: 1,
    width: Dimensions.get('window').width / 1.1,
    height: Dimensions.get('window').width / 2,
    resizeMode: 'contain'
  },
  modelImageContainer: {
    flex: 1,
    width: Dimensions.get('window').width / 1.1,
    height: Dimensions.get('window').width / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
    video: {
    marginTop: 20,
    maxHeight: 200,
    width: 320,
  }
});

var universalModelData = [];
var universalMakeData = [];

class TradMakes extends Component {
  static navigationOptions = {
    title: 'Makes',
    headerStyle: { backgroundColor: '#f9f9f9' },
    headerTitleStyle: { color: 'black' },
  };
  state = {
    fontLoaded: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
    }
  }

  async componentDidMount() {
    //Load custom fonts
    await Font.loadAsync({
      'MavenProRegular': require('./assets/fonts/MavenPro-Regular.ttf'),
    });
    this.setState({ fontLoaded: true });

    return fetch('http://pl0x.net/ReloadAllData.php')
      .then((response) => response.json())
      .then((responseJson) => {
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.setState({
          isLoading: false,
          makeData: ds.cloneWithRows(this.alphaSortMakeArray(this.filterToObjectType('Make', responseJson))),
          modelData: this.filterToObjectType('Model', responseJson),
        }, function() {
          // do something with new state
          universalModelData = this.state.modelData;
          universalMakeData = this.state.makeData;
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  //Filters the entire data array down to the specific data type
  filterToObjectType(objectType, allData) {
    var filteredArray = [];
    for(var i=0; i<allData.length; i++) {
      if(allData[i].ObjectType == objectType) {
        filteredArray.push(allData[i]);
      }
    }
    return filteredArray;
  }

  alphaSortMakeArray(makeArray) {
    function compareStrings(a, b) {
      a = a.toLowerCase();
      b = b.toLowerCase();
      return (a < b) ? -1 : (a > b) ? 1 : 0;
    }

    makeArray.sort(function(a, b) {
      return compareStrings(a.Make, b.Make);
    })
    return makeArray;
  }

  getMakeImageURL(rowData) {
    searchString = '?carno=';
    if (rowData.ImageURL.indexOf(searchString.toLowerCase()) > -1) {
      return 'http://pl0x.net/image2.php' + rowData.ImageURL;
    } else {
      return 'http://pl0x.net/CarPictures/' + rowData.ImageURL;
    }
  }

  render() {
    const { navigate } = this.props.navigation;
    if (this.state.isLoading) {
      return (
        <View style={{flex: 1, paddingTop: 20, backgroundColor: '#ffffff'}}>
          <ActivityIndicator />
        </View>
      );
    }
    var imgURL = 'Image URL'

    return (
      <View style={{flex: 1, justifyContent:'center', alignItems: 'center', backgroundColor: '#ffffff'}}>
        <ListView contentContainerStyle={styles.makeList}
          dataSource={this.state.makeData}
          renderRow={(rowData) =>
            <TouchableOpacity onPress = {() => navigate('ModelView', {make: rowData.Make, class: 'Class'})}> 
              <View style={styles.makeCell}>
                <View style = {styles.makeImageContainer}>
                  <Image source={{uri:this.getMakeImageURL(rowData)}} style={styles.makeImage}/>
                </View>
                <Text style = {styles.makeText}>{rowData.Make}</Text>
              </View>
            </TouchableOpacity>
        }/>
      </View>
    );
  }

  pushMake(selectedMake) {
    console.log(selectedMake.Make);
  }
}

class ModelView extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `${navigation.state.params.make}`,
  });

  //Filters the entire data array down to the specific data type
  filterToCurrentMake(makeName, allModels) {
    var filteredArray = [];
    for(var i=0; i<allModels.length; i++) {
      if(allModels[i].Make == makeName) {
        filteredArray.push(allModels[i]);
      }
    }
    return filteredArray;
  }

  filterToClasses(modelArray) {
    var filteredArray = [];
    for(var i=0; i<modelArray.length; i++) {
      if(modelArray[i].isClass == '1') {
        filteredArray.push(modelArray[i]);
      }
    }
    return filteredArray;
  }

  alphaSortModelArray(modelArray) {
    function compareStrings(a, b) {
      a = a.toLowerCase();
      b = b.toLowerCase();
      return (a < b) ? -1 : (a > b) ? 1 : 0;
    }

    modelArray.sort(function(a, b) {
      return compareStrings(a.Model, b.Model);
    })
    return modelArray;
  }

  getModelImageURL(rowData) {
    searchString = '?carno=';
    if (rowData['Image URL'].indexOf(searchString.toLowerCase()) > -1) {
      return 'http://pl0x.net/image.php' + rowData['Image URL'];
    } else {
      return 'http://pl0x.net/CarPictures/' + rowData['Image URL'];
    }
  }

  render() {
    const { params } = this.props.navigation.state;
    currentModels = this.filterToCurrentMake(params.make, universalModelData);
    currentModels = this.filterToClasses(currentModels);
    console.log(currentModels.length);
    console.log(currentModels[0].ImageHTML);

    let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    modelData = ds.cloneWithRows(this.alphaSortModelArray(currentModels));

    return (
      <View style={{flex: 1, justifyContent:'center', alignItems: 'center', backgroundColor: '#ffffff'}}>
        <ListView contentContainerStyle={styles.modelList}
          dataSource={modelData}
          renderRow={(rowData) =>
            <TouchableOpacity onPress = {() => navigate('ModelView', {make: rowData.Make})}> 
              <View style={styles.makeCell}>
                <Text style = {styles.makeText}>{rowData.Model}</Text>
                <View style = {styles.modelImageContainer}>
                  <WebView source={{ html: rowData.ImageHTML }} style={styles.video} scrollEnabled={false}/>
                </View>
              </View>
            </TouchableOpacity>
        }/>
      </View>
    );
  }
}

const SimpleStack = StackNavigator({
  TradMakes: { screen: TradMakes },
  ModelView: { screen: ModelView },
});

export default SimpleStack;