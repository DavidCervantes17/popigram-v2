import React from 'react';
import { Clipboard, Alert } from 'react-native';
import Header from '../../layout/Header';
import { ImageNotData, ImageNotDataWrapper } from './styles';
import parseUrl from '../../utils/parseUrl';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import uuid from 'uuid/v4';
import DownloadFile from '../../components/DownloadFile';
import extractFileUrl from '../../utils/extractFileUrl';
import InstagramRequest from '../../services/instagramRequest';

class Home extends React.Component {
  state = {
    fileUrl: '',
    sourceUrl: null,
    sourceType: null
  };

  handlePasteButton = fileUrl => () => {
    Clipboard.getString().then(dataPasted => {
      this.setState({ fileUrl: dataPasted });
    });
  };

  handleCheckUrl = async () => {
    const { fileUrl } = this.state;
    const { url: urlParsed, error: parseError } = parseUrl(fileUrl);
    if (parseError) {
      Alert.alert('Error', 'Invalid url');
      return;
    }
    const fileData = await InstagramRequest.getFileData(urlParsed);
    const { data, error, type } = extractFileUrl(fileData);
    if (error) {
      Alert.alert('Error', 'Try again');
      return;
    }
    this.setState({ fileUrl: '', sourceUrl: data, sourceType: type });
  };

  onChangeInput = fileUrl => {
    this.setState({ fileUrl });
  };

  resetDownload = () => {
    this.setState({ sourceUrl: null, sourceType: null });
  };

  downloadFile = () => {
    const { sourceType, sourceUrl } = this.state;
    FileSystem.downloadAsync(
      sourceUrl,
      FileSystem.documentDirectory +
        uuid() +
        (sourceType === 'GraphVideo' ? '.mp4' : '.jpg')
    )
      .then(async ({ uri }) => {
        MediaLibrary.saveToLibraryAsync(uri).then(() => {
          Alert.alert('Popigram', 'File downloaded succesfully');
        });
      })
      .catch(error => {
        Alert.alert('Error', 'Try again');
      });
  };

  render() {
    const { fileUrl, sourceType, sourceUrl } = this.state;

    return (
      <>
        <Header
          handlePasteButton={this.handlePasteButton}
          onChangeInput={this.onChangeInput}
          handleCheckUrl={this.handleCheckUrl}
          fileUrl={fileUrl}
        />
        {sourceUrl && (
          <DownloadFile
            uri={sourceUrl}
            sourceType={sourceType}
            downloadFile={this.downloadFile}
            resetDownload={this.resetDownload}
          />
        )}
        {!sourceUrl && (
          <ImageNotDataWrapper>
            <ImageNotData source={require('../../../assets/attach.png')} />
          </ImageNotDataWrapper>
        )}
      </>
    );
  }
}

export default Home;
