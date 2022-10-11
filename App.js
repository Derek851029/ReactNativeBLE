import React, {
  useState,
  useEffect,
} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
  Alert,
  ToastAndroid,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import KeepAwake from 'react-native-keep-awake';

import BleManager, { write } from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const App = () => {
  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);


  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 5).then((results) => {
        console.log('Scanning...');
        setIsScanning(true);
      }).catch(err => {
        console.error(err);
      });
    }    
  }

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  }

  const handleDisconnectedPeripheral = (data) => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
    console.log('Disconnected from ' + data.peripheral);
    showToast('斷開連接')
  }

  const handleUpdateValueForCharacteristic = (data) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
    var type = data.value[1]
    Carpet_Type(type)
  }

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log('No connected peripherals')
      }
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });
  }

  const handleDiscoverPeripheral = (peripheral) => {
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
    setList(Array.from(peripherals.values()));
  }

  const testPeripheral = (peripheral) => {
    if (peripheral){
      if (peripheral.connected){
        BleManager.disconnect(peripheral.id);
      }else{
        BleManager.connect(peripheral.id).then(() => {
          let p = peripherals.get(peripheral.id);
          if (p) {
            p.connected = true;
            peripherals.set(peripheral.id, p);
            setList(Array.from(peripherals.values()));
          }
          console.log('Connected to ' + peripheral.id);

          setTimeout(() => {
            
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(peripheralInfo);
              for(let i=0;i<peripheralInfo.characteristics.length;i++){
                console.log(peripheralInfo.characteristics[i])
              }
              var data = 'F503000050F50D0A'
              // var data = stringToBytes(str)
              var serviceUUID = 'a2c20000-0000-0000-0000-00000000cf00'
              var characteristicUUID = 'a2c20000-0000-0000-0000-00000000cf04'
              // serviceUUID = '0000' + serviceUUID.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
              // characteristicUUID = '0000' + characteristicUUID.toLowerCase() + '-0000-1000-8000-00805F9B34FB'

              setTimeout(() => {
                BleManager.startNotification(peripheral.id, '6a4e2800-667b-11e3-949a-0800200c9a66', '6a4e2812-667b-11e3-949a-0800200c9a66').then(() => {
                  console.log('Started notification on ');
                  showToast('連線成功')
                  // setTimeout(() => {
                  //   BleManager.write(peripheral.id, serviceUUID, characteristicUUID, data).then(() => {
                  //     console.log('Writed NORMAL crust');
                  //   });
                  // }, 500);
                  }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 200);
            });

            // BleManager.retrieveServices(peripheral.id).then((peripheralData) => {
            //   // console.log('Retrieved peripheral services', peripheralData);
            //   for(let i=0;i<peripheralData.characteristics.length;i++){
            //     console.log(peripheralData.characteristics[i])
            //   }
            //   setTimeout(()=>{
            //     var str = 'F8010101010101F8'
            //     var data = stringToBytes(str)
            //     var serviceUUID = '4000'
            //     var characteristicUUID = 'ddd4'
            //     serviceUUID = '0000' + serviceUUID.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
            //     characteristicUUID = '0000' + characteristicUUID.toLowerCase() + '-0000-1000-8000-00805F9B34FB'
            //     BleManager.write(
            //       peripheral.id,
            //       serviceUUID,
            //       characteristicUUID,
            //       data
            //     )
            //     .then(() => {
            //       // Success code
            //       console.log("Write: " + data);
            //     })
            //     .catch((error) => {
            //       // Failure code
            //       console.log(error);
            //     });
            //   })
              

            //   BleManager.readRSSI(peripheral.id).then((rssi) => {
            //     console.log('Retrieved actual RSSI value', rssi);
            //     let p = peripherals.get(peripheral.id);
            //     if (p) {
            //       p.rssi = rssi;
            //       peripherals.set(peripheral.id, p);
            //       setList(Array.from(peripherals.values()));
            //     }                
            //   });                                          
            // });

            // Test using bleno's pizza example
            // https://github.com/sandeepmistry/bleno/tree/master/examples/pizza
            /*
            BleManager.retrieveServices(peripheral.id).then((peripheralInfo) => {
              console.log(peripheralInfo);
              var service = '13333333-3333-3333-3333-333333333337';
              var bakeCharacteristic = '13333333-3333-3333-3333-333333330003';
              var crustCharacteristic = '13333333-3333-3333-3333-333333330001';
              setTimeout(() => {
                BleManager.startNotification(peripheral.id, service, bakeCharacteristic).then(() => {
                  console.log('Started notification on ' + peripheral.id);
                  see(peripheral.id, service, crustCharacteristic, [0]).then(() => {
                      console.log('Writed NORMAL crust');
                      BleManager.write(peripheral.id, service, batTimeout(() => {
                    BleManager.writkeCharacteristic, [1,95]).then(() => {
                        console.log('Writed 351 temperature, the pizza should be BAKED');
                        
                        //var PizzaBakeResult = {
                        //  HALF_BAKED: 0,
                        //  BAKED:      1,
                        //  CRISPY:     2,
                        //  BURNT:      3,
                        //  ON_FIRE:    4
                        //};
                      });
                    });
                  }, 500);
                }).catch((error) => {
                  console.log('Notification error', error);
                });
              }, 200);
            });*/
            
            

          }, 900);
        }).catch((error) => {
          console.log('Connection error', error);
        });
        // var str = 'F8010101010101F8'
        // var data = stringToBytes(str)
        
        
      }
    }

  }

  const Carpet_Type = async(type) =>{
    const parseString = require('react-native-xml2js').parseString;
    var data;
    fetch('http://210.68.227.123:8003/Furniture_control.asmx/Carpet_Type',{
      timeout:1000,
      method : 'POST',
      headers: {
        Accept: 'application/x-www-form-urlencoded',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'type='+type+'',
    })
    .then(response => response.text())
    .then((response) =>{
      parseString(response, async function (err, result) {
      })
    })
    .catch((e)=>{
        console.log(e)
        Alert.alert(
            "警告:",
            "伺服器發生錯誤，請重新嘗試或洽詢管理員",
            [
                { text: "OK", onPress: () => {} }
            ]
        );
    })
  }

  const showToast = (text) => {
    ToastAndroid.show(text, ToastAndroid.SHORT);
  };

  const Coneect_Door = () =>{
    var peripheral_id = 'C0:17:4C:4C:99:59'
    BleManager.connect(peripheral_id).then(() => {
      let p = peripherals.get(peripheral_id);
      if (p) {
        p.connected = true;
        peripherals.set(peripheral_id, p);
        setList(Array.from(peripherals.values()));
      }
      // console.log('Connected to ' + peripheral_id);

      setTimeout(() => {
        
        BleManager.retrieveServices(peripheral_id).then((peripheralInfo) => {
          console.log(peripheralInfo);
          // for(let i=0;i<peripheralInfo.characteristics.length;i++){
          //   console.log(peripheralInfo.characteristics[i])
          // }
          var data = 'F8010101010101F8'
          // var data = stringToBytes(str)
          var serviceUUID = '4000'
          var characteristicUUID = 'ddd4'
          serviceUUID = '0000' + serviceUUID.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
          characteristicUUID = '0000' + characteristicUUID.toLowerCase() + '-0000-1000-8000-00805F9B34FB'

          setTimeout(() => {
            BleManager.startNotification(peripheral_id, serviceUUID, characteristicUUID).then(() => {
              // console.log('Started notification on ');
              // Door_write(peripheral_id,serviceUUID,characteristicUUID)
              // setTimeout(() => {
              //   BleManager.write(peripheral_id, serviceUUID, characteristicUUID, data).then(() => {
              //     // console.log('Writed NORMAL crust');
              //     BleManager.disconnect(peripheral_id);
              //     Ultrasound()
              //     Change_Door()
              //   });
              // }, 500);

              }).catch((error) => {
              console.log('Notification error', error);
            });
          }, 200);
        });
      }, 900);
    }).catch((error) => {
      console.log('Connection error', error);
    });
  }

  const Ultrasound = () =>{
    var peripheral_id = 'CB:32:32:36:56:7E'
    BleManager.connect(peripheral_id).then(() => {
      let p = peripherals.get(peripheral_id);
      if (p) {
        p.connected = true;
        peripherals.set(peripheral_id, p);
        setList(Array.from(peripherals.values()));
      }
      console.log('Connected to ' + peripheral_id);
      
      setTimeout(() => {
        
        BleManager.retrieveServices(peripheral_id).then((peripheralInfo) => {
          console.log(peripheralInfo);
          for(let i=0;i<peripheralInfo.characteristics.length;i++){
            console.log(peripheralInfo.characteristics[i])
          }
          var serviceUUID = 'ca10'
          var characteristicUUID = 'ca14'
          serviceUUID = '0000' + serviceUUID.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
          characteristicUUID = '0000' + characteristicUUID.toLowerCase() + '-0000-1000-8000-00805F9B34FB'

          setTimeout(() => {
            BleManager.startNotification(peripheral_id, serviceUUID, characteristicUUID).then(() => {
              console.log('Started notification on ');
              Coneect_Door()
              }).catch((error) => {
              console.log('Notification error', error);
            });
          }, 200);
        });
      }, 900);
    }).catch((error) => {
      console.log('Connection error', error);
    });
  }

  const Door_write = () =>{
    var peripheral_id = 'C0:17:4C:4C:99:59'
    var serviceUUID = '4000'
    var characteristicUUID = 'ddd4'

    serviceUUID = '0000' + serviceUUID.toUpperCase() + '-0000-1000-8000-00805F9B34FB'
    characteristicUUID = '0000' + characteristicUUID.toLowerCase() + '-0000-1000-8000-00805F9B34FB'

    var data = 'F8010101010101F8'
    setTimeout(() => {
      BleManager.write(peripheral_id, serviceUUID, characteristicUUID, data).then(() => {
        // console.log('Writed NORMAL crust');
      });
    }, 500);
  }

  useEffect(() => {
    BleManager.start({showAlert: false});
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan );
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
          if (result) {
            console.log("Permission is OK");
          } else {
            PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
              if (result) {
                console.log("User accept");
              } else {
                console.log("User refuse");
              }
            });
          }
      });
    }
    KeepAwake.activate();
       
    return (() => {
      console.log('unmount');
      bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
      bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan );
      bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
      bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );
    })
  }, []);

  const renderItem = (item) => {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => testPeripheral(item) }>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text style={{fontSize: 12, textAlign: 'center', color: '#333333', padding: 10}}>{item.name}</Text>
          <Text style={{fontSize: 10, textAlign: 'center', color: '#333333', padding: 2}}>RSSI: {item.rssi}</Text>
          <Text style={{fontSize: 8, textAlign: 'center', color: '#333333', padding: 2, paddingBottom: 20}}>{item.id}</Text>
        </View>
      </TouchableHighlight>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}>
          {global.HermesInternal == null ? null : (
            <View style={styles.engine}>
              <Text style={styles.footer}>Engine: Hermes</Text>
            </View>
          )}
          <View style={styles.body}>
            <View style={{margin: 10}}>
              <Button 
                title={'搜尋裝置 (' + (isScanning ? 'on' : 'off') + ')'}
                onPress={() => startScan() } 
              />            
            </View>

            <View style={{margin: 10}}>
              <Button title="Retrieve connected peripherals" onPress={() => retrieveConnected() } />
            </View>

            {(list.length == 0) &&
              <View style={{flex:1, margin: 20}}>
                <Text style={{textAlign: 'center'}}>No peripherals</Text>
              </View>
            }
          
          </View>              
        </ScrollView>
        <FlatList
            data={list}
            renderItem={({ item }) => renderItem(item) }
            keyExtractor={item => item.id}
          />              
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
});

export default App;