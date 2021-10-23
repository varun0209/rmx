import { TestingDevice } from './../../../models/testing/TestingDevice';
import { Component, OnInit, ViewChild, ElementRef, Renderer2, OnDestroy, Inject } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';
import { String } from 'typescript-string-operations';
import { MasterPageService } from './../../../utilities/rlcutl/master-page.service';
import { ApiConfigService } from './../../../utilities/rlcutl/api-config.service';
import { AppErrorService } from './../../../utilities/rlcutl/app-error.service';
import { CommonService } from './../../../services/common.service';
import { EsnCapImages } from './../../../models/common/ImageCapture';
import { ClientData } from './../../../models/common/ClientData';
import { UiData } from './../../../models/common/UiData';
import { CommonEnum } from './../../../enums/common.enum';
import { dropdown } from '../../../models/common/Dropdown';
import { NgxSpinnerService } from 'ngx-spinner';
import { AppService } from '../../../utilities/rlcutl/app.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-image-process',
  templateUrl: './image-process.component.html',
  styleUrls: ['./image-process.component.css']
})

export class ImageProcessComponent implements OnInit, OnDestroy {
  @ViewChild('video') videoElement: ElementRef;
  @ViewChild('canvas') canvas: ElementRef;

  mediaDevices: any;

  serialNumber: string;
  docTrackingImages = [];
  captures = [];
  isNextBtnEnabled = true;
  isDontRejectDisabled = true;
  selectedBoxImage: EsnCapImages;
  selectedBoxImageIndex: number;
  selectedCamera: string;
  imageTypes = [];
  cameraList = [];
  isImageCaptureBtnDisable = true;

  // control min and max value variables
  zoomMin: number;
  zoomMax: number;
  zoomValue: number;
  rangeStep: number;
  brightnessMin: number;
  brightnessMax: number;
  brightnessValue: number;
  brightnessStep: number;
  sharpnessMin: number;
  sharpnessMax: number;
  sharpnessValue: number;
  sharpnesStep: number;
  saturationMin: number;
  saturationMax: number;
  saturationValue: number;
  saturationStep: number;
  contrastMin: number;
  contrastMax: number;
  contrastValue: number;
  contrastStep: number;
  whiteBalanceValue: number;
  whiteBalanceMin: number;
  whiteBalanceMax: number;
  whiteBalanceStep: number;
  showZoom = true;
  showBrightness = true;
  showSharpness = true;
  showSaturation = true;
  showColorTemperature = true;
  showContrast = true;
  isCameraError = false;
  isCameraErrorText: string;
  isCameraLoading = false;

  imageCapture: any;
  mediaStream: any;
  mediaStreamTrack: any;
  capabilities: any;
  imagesCaptured = 0;
  reasonOptions = [];
  selectedReason = '';
  commonEnum = CommonEnum;
  showDoNotReject = CommonEnum.no;

  // declaring objects
  clientData = new ClientData();
  uiData = new UiData();
  deviceObj = new TestingDevice();




  constructor(
    private renderer: Renderer2,
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    public masterPageService: MasterPageService,
    private apiConfigService: ApiConfigService,
    private appService: AppService,
    private appErrorService: AppErrorService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ImageProcessComponent>,
  ) {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener('devicechange', event => {
        this.stopStreaming();
        this.getVideoInputs();
        this.selectedCamera = null;
      });
    }
  }

  ngOnInit() {
    this.clientData = this.data.requestObj.data.ClientData;
    this.uiData = this.data.requestObj.data.UIData;
    this.deviceObj = this.data.requestObj.data.Device;
    this.docTrackingImages = this.data.requestObj.data.docTrackingImages;
    this.showDoNotReject = this.data.requestObj.ShowDoNotReject;
    this.getVideoInputs();
    this.getNumberofImagestoCapture();
    this.getImgCapDisqualifyReason();    
  }

  // get box view
  getBoxView(fileName) {
    if (fileName) {
      return fileName.split('_')[1];
    }
  }

  // show base64 image
  getBase64Image(imageBytes) {
    if (imageBytes) {
      return String.Join(',', 'data:image/png;base64', imageBytes);
    }
  }

  reasonChange(event) {
    this.selectedReason = event.value;
    this.isDontRejectDisabled = false;
    this.isNextBtnEnabled = false;
  }

  // selectedBox View
  selectBoxView(boxImage, index) {
    this.selectedBoxImage = new EsnCapImages();
    this.selectedBoxImage.TRKNO = boxImage.TRKNO;
    this.selectedBoxImage.ESN = this.serialNumber;
    this.selectedBoxImage.CYCLENUM = boxImage.CYCLENUM;
    this.selectedBoxImage.RECEIPTKEY = boxImage.RECEIPTKEY;
    this.selectedBoxImage.FILELABEL = this.getBoxView(boxImage.FILENAME);
    this.selectedBoxImage.FILETYPE = CommonEnum.box;
    this.selectedBoxImage.STATUS = CommonEnum.new;
    this.selectedBoxImage.ImageBytes = boxImage.ImageBytes;
    this.selectedBoxImage.IVCCODE = boxImage.IVCCODE;
    this.selectedBoxImageIndex = index;
    this.isNextBtnEnabled = true;
  }


  // get connected available devices
  getVideoInputs() {
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream =>
          navigator.mediaDevices
            .enumerateDevices()
            .then(devices => {
              this.masterPageService.mediaStream = stream;
              this.cameraList = devices.filter(device => device.kind === CommonEnum.videoinput);
              // this.stopStreaming();
            }).catch(err => { this.handleError(err); })
        ).catch(err => { this.handleError(err); });
    }
  }

  changeCamera(event) {
    this.isCameraErrorText = null;
    this.appErrorService.clearAlert();
    this.selectedCamera = event.value;
    if (this.selectedCamera) {
      this.showCapabilities();
      // this.clearStreamValues();
      this.startCamera();
    }
  }

  selectionChange(event) {
    this.appErrorService.clearAlert();
    // if (event.selectedIndex === 1) {
    //   //  this.startCamera();
    // } else if (this.mediaStreamTrack) {
    //   this.mediaStreamTrack.stop();
    // }
  }

  startCamera() {
    this.stopStreaming();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      // this.spinner.show();
      this.isCameraLoading = true;
      navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: this.selectedCamera } } }).then(stream => {
        this.masterPageService.mediaStream = stream;
        this.attachVideo(stream);
      }).catch((e) => {
        this.handleError(e);
      });
    }
  }

  // attaching video to video element
  attachVideo(stream) {
    this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
    this.renderer.listen(this.videoElement.nativeElement, 'play', (event) => {
      this.mediaStreamTrack = stream.getVideoTracks()[0];
      this.capabilities = this.mediaStreamTrack.getCapabilities();
      if (this.capabilities.deviceId === this.selectedCamera) {
        const settings = this.mediaStreamTrack.getSettings();
        if (this.capabilities.zoom) {
          this.zoomMin = this.capabilities.zoom.min;
          this.zoomMax = this.capabilities.zoom.max;
          this.rangeStep = this.capabilities.zoom.step;
          this.zoomValue = settings.zoom;
          this.applyZoom(this.zoomValue);
        } else {
          this.showZoom = false;
        }
        if (this.capabilities.brightness) {
          this.brightnessMin = this.capabilities.brightness.min;
          this.brightnessMax = this.capabilities.brightness.max;
          this.brightnessStep = this.capabilities.brightness.step;
          this.brightnessValue = settings.brightness;
          this.applyBrightness(this.brightnessValue);
        } else {
          this.showBrightness = false;
        }
        if (this.capabilities.sharpness) {
          this.sharpnessMin = this.capabilities.sharpness.min;
          this.sharpnessMax = this.capabilities.sharpness.max;
          this.sharpnesStep = this.capabilities.sharpness.step;
          this.sharpnessValue = settings.sharpness;
          this.applySharpness(this.sharpnessValue);
        } else {
          this.showSharpness = false;
        }
        if (this.capabilities.saturation) {
          this.saturationMin = this.capabilities.saturation.min;
          this.saturationMax = this.capabilities.saturation.max;
          this.saturationStep = this.capabilities.saturation.step;
          this.saturationValue = settings.saturation;
          this.applySaturation(this.saturationValue);
        } else {
          this.showSaturation = false;
        }
        if (this.capabilities.colorTemperature) {
          this.whiteBalanceMin = this.capabilities.colorTemperature.min;
          this.whiteBalanceMax = this.capabilities.colorTemperature.max;
          this.whiteBalanceStep = this.capabilities.colorTemperature.step;
          this.whiteBalanceValue = settings.colorTemperature;
          // this.colorTemperatureRange.nativeElement.value = settings.colorTemperature;
          this.applyWhiteBalance(this.whiteBalanceValue);
        } else {
          this.showColorTemperature = false;
        }
        if (this.capabilities.contrast) {
          this.contrastMin = this.capabilities.contrast.min;
          this.contrastMax = this.capabilities.contrast.max;
          this.contrastStep = this.capabilities.contrast.step;
          this.contrastValue = settings.contrast;
          this.applyContrast(this.contrastValue);
        } else {
          this.showContrast = false;
        }
      }
    });
    if (this.imageTypes.length !== this.captures.length) {
      this.isImageCaptureBtnDisable = false;
    }
    this.isCameraLoading = false;
    // this.spinner.hide();
  }

  // take a picture
  capture() {
    if (this.masterPageService.mediaStream && this.masterPageService.mediaStream.active) {
      if (this.canvas && this.canvas.nativeElement) {
        const canvaImage = this.canvas.nativeElement.getContext('2d');
        if (this.capabilities.width && this.capabilities.height) {
          canvaImage.width = this.capabilities.width.max;
          canvaImage.height = this.capabilities.height.max;
        }
        canvaImage.drawImage(this.videoElement.nativeElement, 0, 0);
        this.captures.push(
          {
            TRKNO: this.selectedBoxImage ? this.selectedBoxImage.TRKNO : null,
            ESN: this.deviceObj.SerialNumber,
            CYCLENUM: this.deviceObj.CycleNumber,
            RECEIPTKEY: this.deviceObj.ReceiptKey,
            FILELABEL: this.imageTypes[this.imagesCaptured].ID,
            FILETYPE: 'DEVICE',
            ImageBytes: this.canvas.nativeElement.toDataURL().split(',')[1],
            IVCCODE: this.deviceObj.IVCCode,
            STATUS: this.selectedBoxImage ? this.selectedBoxImage.STATUS : CommonEnum.new
          });
        this.imageTypes[this.imagesCaptured].Status = CommonEnum.completed;
        this.imagesCaptured++;
        if (this.imageTypes.length === this.captures.length) {
          this.isImageCaptureBtnDisable = true;
        }
      }
    }
  }

  doneWithPictures() {
    let capturedData = [];
    capturedData = this.captures;
    if (this.selectedBoxImage) {
      capturedData.push(this.selectedBoxImage);
    }
    this.dialogRef.close({ CapturedImages: capturedData });
    this.appErrorService.clearAlert();
    this.stopStreaming();
  }

  hideModal() {
    this.dialogRef.close(null);
    this.stopStreaming();
  }

  // cleare captured pictured
  clearImages() {
    this.captures = [];
    this.imagesCaptured = 0;
    if (this.selectedCamera && (this.imageTypes.length !== this.captures.length)) {
      this.isImageCaptureBtnDisable = false;
    }
    this.imageTypes.forEach(element => {
      element.Status = CommonEnum.notCompleted;
    });
  }

  // on zoom change
  zoomInOut(event) {
    // Check whether zoom is supported or not.
    this.appErrorService.clearAlert();
    if (!this.capabilities.zoom) {
      return;
    }
    this.applyZoom(event.value);
  }

  // on brightness change
  brightnessChange(event) {
    this.appErrorService.clearAlert();
    if (!this.capabilities.brightness) {
      return;
    }
    this.applyBrightness(event.value);
  }

  // on sharpness change
  sharpnessChange(event) {
    this.appErrorService.clearAlert();
    if (!this.capabilities.sharpness) {
      return;
    }
    this.applySharpness(event.value);
  }

  // on saturation change
  saturationChange(event) {
    this.appErrorService.clearAlert();
    if (!this.capabilities.saturation) {
      return;
    }
    this.applySaturation(event.value);
  }

  // on contrast change
  constrastChange(contrastRange) {
    this.appErrorService.clearAlert();
    if (!this.capabilities.contrast) {
      return;
    }
    this.applyContrast(contrastRange.value);
  }

  // on white balance change
  whiteBalanceChange(colorTemperatureRange) {
    this.appErrorService.clearAlert();
    if (!this.capabilities.colorTemperature) {
      return;
    }
    this.applyWhiteBalance(colorTemperatureRange.value);
  }

  /*----------- common methods for applying constraints */
  applyZoom(value) {
    if (this.mediaStreamTrack) {
      this.mediaStreamTrack.applyConstraints({ advanced: [{ zoom: value }] })
        .catch((error) => { this.appErrorService.setAlert(error, true); });
    }
  }

  applyBrightness(value) {
    if (this.mediaStreamTrack) {
      this.mediaStreamTrack.applyConstraints({ advanced: [{ brightness: value }] })
        .catch((error) => { this.appErrorService.setAlert(error, true); });
    }
  }

  applySharpness(value) {
    if (this.mediaStreamTrack) {
      this.mediaStreamTrack.applyConstraints({ advanced: [{ sharpness: value }] })
        .catch((error) => { this.appErrorService.setAlert(error, true); });
    }
  }

  applySaturation(value) {
    if (this.mediaStreamTrack) {
      this.mediaStreamTrack.applyConstraints({ advanced: [{ saturation: value }] })
        .catch((error) => { this.appErrorService.setAlert(error, true); });
    }
  }

  applyContrast(value) {
    if (this.mediaStreamTrack) {
      this.mediaStreamTrack.applyConstraints({ advanced: [{ contrast: value }] })
        .catch((error) => { this.appErrorService.setAlert(error, true); });
    }
  }

  applyWhiteBalance(value) {
    if (this.mediaStreamTrack) {
      this.mediaStreamTrack.applyConstraints({ advanced: [{ colorTemperature: value }] })
        .catch((error) => { this.appErrorService.setAlert(error, true); });
    }
  }

  /*----------- common methods for applying constraints */
  // images to capture
  getNumberofImagestoCapture() {
    this.commonService.commonApiCall(this.apiConfigService.getNumberofImagestoCaptureUrl, this.data.requestObj.data, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.imageTypes = this.getImageTypeStatus(res.Response.ImageTypes);
      }
    });
  }

  // get reasons
  getImgCapDisqualifyReason() {
    this.commonService.commonApiCall(this.apiConfigService.getImgCapDisqualifyReasonUrl, this.data.requestObj.data, (res, statusFlag) => {
      this.spinner.hide();
      if (statusFlag) {
        this.reasonOptions = [];
        if (res.Response.reasons.length) {
          res.Response.reasons.forEach((element) => {
            let dd: dropdown = new dropdown();
            dd.Id = element;
            dd.Text = element;
            this.reasonOptions.push(dd);
          });
        }
      }
    });
  }

  // appending Status property
  getImageTypeStatus(data) {
    return data.map(obj => ({ ...obj, Status: CommonEnum.notCompleted }));
  }

  // donot reject
  donotReject() {
    this.appErrorService.clearAlert();
    if (this.selectedReason) {
      this.spinner.show();
      const url = String.Join('/', this.apiConfigService.donotRejectUrl, this.selectedReason);
      this.commonService.commonApiCall(url, this.data.requestObj.data, (res, statusFlag) => {
        if (statusFlag) {
          if (!this.appService.checkNullOrUndefined(res.Response.Device)) {
            this.dialogRef.close({ Device: res.Response.Device });
            this.stopStreaming();
          }
        }
      });
    }
  }

  // stop stream
  stopStreaming() {
    if (this.masterPageService.mediaStream) {
      this.masterPageService.mediaStream.getVideoTracks().forEach(track => {
        track.stop();
      });
    }
  }

  clearStreamValues() {
    this.mediaStreamTrack = null;
    this.capabilities = null;
  }


  // handling error
  handleError(error) {
    switch (error.name) {
      case 'NotFoundError':
        this.isCameraErrorText = 'Device Not found';
        console.log('Device Not found');
        break;
      case 'DevicesNotFoundError':
        this.isCameraErrorText = 'Please setup your webcam first.';
        break;
      case 'SourceUnavailableError':
        this.isCameraErrorText = 'Your Webcam is busy';
        break;
      case 'PermissionDeniedError':
      case 'SecurityError':
        this.isCameraErrorText = 'Permission denied!';
        break;
      default:
        this.isCameraErrorText = error;
    }
  }

  showCapabilities() {
    this.showZoom = true;
    this.showBrightness = true;
    this.showSharpness = true;
    this.showSaturation = true;
    this.showColorTemperature = true;
    this.showContrast = true;
  }

  ngOnDestroy() {
    this.showCapabilities();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
    this.masterPageService.hideDialog();
  }
}
