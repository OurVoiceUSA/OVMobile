import React, { PureComponent } from 'react';
import {
  AsyncStorage,
  Dimensions,
  TouchableOpacity,
  TouchableHighlight,
  FlatList,
  Text,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';

import { Dropbox } from 'dropbox';
import DeviceInfo from 'react-native-device-info';
import storage from 'react-native-storage-wrapper';
import t from 'tcomb-form-native';

var Form = t.form.Form;

const SAND = t.enums({
  'SA': 'Strongly Agree',
  'A': 'Agree',
  'N': 'Neutral',
  'D': 'Disagree',
  'SD': 'Strongly Disagree',
}, 'SAND');

const Party = t.enums({
  'D': 'Democrat',
  'R': 'Republican',
  'I': 'Independent',
  'G': 'Green',
  'L': 'Libertarian',
  'O': 'Other',
}, 'Party');

var CanvassForm = t.struct({});
var options = {};

export default class App extends PureComponent {
  constructor(props) {
    super(props);

    const { state } = this.props.navigation;

    this.state = {
      pinId: state.params.pinId,
      address: state.params.address,
      viewOnly: state.params.viewOnly,
      asyncStorageKey: 'OV_CANVASS_PINS@'+state.params.form.id,
      dbx: state.params.dbx,
      form: state.params.form,
    };

    this.doSave = this.doSave.bind(this);
  }

  doSave = async () => {
    const { pinId, dbx, form } = this.state;

    let value = this.refs.form.getValue();
    if (value == null) return;

    try {
      const str = await AsyncStorage.getItem(this.state.asyncStorageKey);
      let myPins = JSON.parse(str);

/*
      for (let i in myPins.pins) {
        if (myPins.pins[i].epoch == pinId
      }
*/
      dbx.filesUpload({ path: '/canvassing/'+DeviceInfo.getUniqueID()+'.txt', contents: JSON.stringify(value), mode: {'.tag': 'overwrite'} });

      this.props.navigation.goBack();

    } catch (error) {
      console.error(error);
      return;
    }

  }

  render() {

    let { viewOnly, form } = this.state;

    let newStruct = {};
    let newOptions = { fields: {} };

    let keys = Object.keys(form.questions);
    for (let k in keys) {
      let value;
      switch (form.questions[keys[k]].type) {
        case 'Number': value = t.Number; break;
        case 'Boolean': value = t.Boolean; break;
        case 'SAND': value = SAND; break;
        case 'Party': value = Party; break;
        default: value = t.String;
      }
      if (form.questions[keys[k]].optional) value = t.maybe(value);
      newStruct[keys[k]] = value;
      newOptions.fields[keys[k]] = { label: form.questions[keys[k]].label + (form.questions[keys[k]].optional ? ' (optional)' : '') };
    }

    CanvassForm = t.struct(newStruct);
    options = newOptions;

    return (
      <ScrollView style={{flex: 1, backgroundColor: 'white'}}>

        <View style={styles.container}>
        <Form
          ref="form"
          type={CanvassForm}
          options={options}
        />
        </View>

        <TouchableHighlight style={styles.button} onPress={this.doSave} underlayColor='#99d9f4'>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableHighlight>

      </ScrollView>
    );
  }
}

var styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 30,
    alignSelf: 'center',
    marginBottom: 30
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    alignSelf: 'center'
  },
  button: {
    height: 36,
    backgroundColor: '#48BBEC',
    borderColor: '#48BBEC',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'stretch',
    justifyContent: 'center'
  }
});

