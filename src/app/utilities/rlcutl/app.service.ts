import { CommonEnum } from './../../enums/common.enum';
import { Injectable, Output } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Grid } from '../../models/common/Grid';
import { String } from 'typescript-string-operations';
import { ApiService } from './api.service';
import { ApiConfigService } from './api-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { XpoSnackBar } from '@xpo/ngx-core/snack-bar';
import { AppErrorService } from './app-error.service';
import { MasterPageService } from './master-page.service';
import { Router } from '@angular/router';
import { ClientData } from '../../models/common/ClientData';
import { RolesList } from '../../models/login/Login';
import { TranslateService } from '@ngx-translate/core';
import { UserIdleService } from 'angular-user-idle';
import * as CryptoJS from 'crypto-js';
import { StorageData } from '../../enums/storage.enum';
import { StatusCodes } from '../../enums/status.enum';
import { RuntimeConfigService } from './runtime-config.service';
import { Title } from '@angular/platform-browser';
import { RmtimmeroutComponent } from '../../framework/frmctl/rmtimmerout/rmtimmerout.component';
import { appRelease } from './../../../assets/app-release-config';
import { checkNullorUndefined } from '../../enums/nullorundefined';
import { MatDialog } from '@angular/material/dialog';

@Injectable()
export class AppService {

    release: string = appRelease.version;
    isMobile: boolean;
    clients = [
        { clientId: "1011", client: 'Verizon', clientImage: 'assets/images/verizonlogo-black.png' },
        { clientId: "1590", client: 'Whirlpool', clientImage: 'assets/images/whirlpool-black.png' },
    ];
    controlConfigs: any;
    hideControls: any;
    controls: any[] = [];
    screenControls = {};
    clientImage: any;
    imageAltText: string;
    siteConfig: any;
    appConfig: any;
    clientData = new ClientData();
    rolesList = new RolesList();
    menu: any;
    rolesBySiteId: any = {};
    selectedMenu: any;
    securityKey = '7061737323313233';
    storageData = StorageData;
    statusCode = StatusCodes;
    env: string;
    appRoutes = [];
    dialogRef: any;
    constructor(private apiService: ApiService,
        private apiConfigService: ApiConfigService,
        private spinner: NgxSpinnerService,
        private snackbar: XpoSnackBar,
        public appErrService: AppErrorService,
        private masterPageService: MasterPageService,
        public translate: TranslateService,
        private http: HttpClient,
        private router: Router,
        private titleService: Title,
        private environment: RuntimeConfigService,
        private userIdle: UserIdleService,
        private dialog: MatDialog) {
        this.titleService.setTitle("Login");
        this.env = this.environment.runtimeConfig.env;
    }

    private pattern: RegExp;

    omit_special_char(event, regexPattern?: any) {
        this.pattern = new RegExp(/[^a-zA-Z0-9]/);
        if (regexPattern) {
            this.pattern = regexPattern;
        }
        if (event.key.match(this.pattern)) {
            return false;
        }
    }

    appImage(ClientId) {
        let client = this.clients.find(i => i.clientId == ClientId);
        if (!this.checkNullOrUndefined(client)) {
            localStorage.setItem(this.storageData.clientImage, client.clientImage);
            localStorage.setItem(this.storageData.imageAltText, client.client);
            this.clientImage = client.clientImage;
            this.imageAltText = client.client;
        }
    }


    //appply required on container
    applyRequired(val: boolean, id?) {
        if (val) {
            let elem: HTMLElement = document.getElementById(id);
            return elem.setAttribute("style", "border: 1px solid red;");
        }
        else {
            let elem: HTMLElement = document.getElementById(id);
            return elem.removeAttribute('style');
        }
    }

    //To Set Id
    getElementId(elementName, index) {
        const elementId = String.Join("_", elementName, index);
        return elementId;
    }

    //To Set Focus
    setFocus(id) {
        if (!this.checkNullOrUndefined(id)) {
            this.masterPageService.focusId = id;
        }
        window.setTimeout(function () {
            let inputElement = <HTMLInputElement>document.getElementById(id);
            if (inputElement) {
                inputElement.focus();
            }
        }, 0);
    }


    //To Set Focus
    setUtilityFocus(id) {
        window.setTimeout(function () {
            let inputElement = <HTMLInputElement>document.getElementById(id);
            if (inputElement) {
                inputElement.focus();
            }
        }, 0);
    }



    //To Select Text
    applySelect(id) {
        window.setTimeout(function () {
            let inputElement = <HTMLInputElement>document.getElementById(id);
            if (inputElement) {
                inputElement.select();
            }
        }, 0);
    }

    //setScroll
    getScrollPosition() {
        var element = document.getElementById("tableScroll");
        if (element) {
            var position = element.scrollTop;
            return position;
        }
    }

    setScroll(id) {
        window.setTimeout(function () {
            var element = document.getElementById("tableScroll");
            if (element) {
                element.scrollTop = id;
            }
        }, 0);
    }

    //hidespinner
    hideSpinner() {
        setTimeout(() => {
            this.spinner.hide();
        }, 450);
    }

    //fqa serial number grid
    onGenerateJson(Response, grid: Grid) {
        let jsonResponse: any;
        let elements = [];
        let ChildElements = [];
        let jsonData = {};
        let columnNames = [];
        let colValues = [];
        let result = {};
        if (this.masterPageService.hideControls && this.masterPageService.hideControls.controlProperties) {
            if (this.masterPageService.hideControls.controlProperties.import) {
                grid.ImportVisible = true;
            }
            if (this.masterPageService.hideControls.controlProperties.export) {
                grid.ExportVisible = true;
            }
            if (this.masterPageService.hideControls.controlProperties.hideSearch) {
                grid.SearchVisible = false;
            }
        }
        jsonResponse = {
            "SearchVisible": grid.SearchVisible,
            "SortDisabled": grid.SortDisabled,
            "ItemsPerPage": grid.ItemsPerPage,
            "TotalRecods": grid.TotalRecods,
            "EditVisible": grid.EditVisible,
            "ImportVisible": grid.ImportVisible,
            "ExportVisible": grid.ExportVisible,
            "EditHighlight": grid.EditHighlight,
            "DeleteVisible": grid.DeleteVisible,
            "CloseVisible": grid.CloseVisible,
            "ShowCheckbox": grid.ShowCheckbox,
            "CheckboxChecked": grid.CheckboxChecked,
            "PaginationVisible": grid.PaginationVisible,
            "PaginationId": Date.now(),
            "RequiredColConfig": grid.RequiredColConfig,
            Elements: Response
        }
        return jsonResponse;
    }

    //to check null or undefined
    checkNullOrUndefined(val) {
        if (val === null || val === undefined) {
            return true;
        } else {
            return false;
        }
    }


    //with this method we will get "false" value if it is Desktop;
    checkDevice() {
        this.isMobile = /iPhone|iPod|Android/i.test(navigator.userAgent);
        return this.isMobile;
    }
    //get Control Config
    getControlConfig(showUserProfile?) {
        let ControlConfig = { "Module": 'LOGIN' };
        this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
        const controlConfigUrl = String.Join("/", this.apiConfigService.getControlConfigUrl);
        let controlConfigObj = { ClientData: this.clientData, ControlConfig };
        this.apiService.apiPostRequest(controlConfigUrl, controlConfigObj)
            .subscribe(response => {
                let res = response.body;
                if (!this.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    if (res.Response != '' && !this.checkNullOrUndefined(res.Response)) {
                        this.controlConfigs = res.Response;
                        localStorage.setItem(this.storageData.controlConfig, this.controlConfigs);
                        this.hideControls = JSON.parse(this.controlConfigs);
                        this.getDeviceId(this.clientData)
                        this.getMenuItems(showUserProfile);
                    }
                }
                else if (!this.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    if (!this.checkNullOrUndefined(showUserProfile)) {
                        localStorage.clear();
                    }
                    this.spinner.hide();
                    this.appErrService.alertMsg = res.StatusMessage;
                }
            }, erro => {
                if (!this.checkNullOrUndefined(showUserProfile)) {
                    localStorage.clear();
                }
                this.appErrService.handleAppError(erro);
            });
    }


    // get Device Id
    getDeviceId(clientData, flag?) {
        const requestObj = { ClientData: clientData };
        this.apiService.apiPostRequest(this.apiConfigService.getdeviceIdUrl, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (res.Status === this.statusCode.pass && !this.checkNullOrUndefined(res)) {
                    this.clientData.DeviceId = res.Response.DeviceId;
                    localStorage.setItem(this.storageData.clientData, JSON.stringify(this.clientData));
                } else if (res.Status === this.statusCode.fail) {
                    this.spinner.hide();
                }
                if (flag) {
                    this.router.navigate(['user-profile']);
                }
            }, erro => {
                this.spinner.hide();
                this.appErrService.handleAppError(erro);
            });
    }

    getErrorText(messageNum) {
        let localData = JSON.parse(localStorage.getItem(this.storageData.messages));
        if (!this.checkNullOrUndefined(localData)) {
            let datafill = localData.find(x => x.MessageNumber == messageNum);
            if (!this.checkNullOrUndefined(datafill)) {
                return datafill.Message;
            }
        }
    }


    getSiteConfig(): any {
        this.http.get('./assets/site-config.json').subscribe((res) => {
            this.siteConfig = res;
        },
            (error: HttpErrorResponse) => {
                this.snackbar.error("Failed to load site config data");
            });
    }

    getAppConfig(): any {
        this.http.get('./assets/app-config.json').subscribe((res) => {
            this.appConfig = res;
            localStorage.setItem(this.storageData.appConfig, JSON.stringify(this.appConfig));
        },
            (error: HttpErrorResponse) => {
                this.snackbar.error("Failed to load application config data");
            });
    }

    patternList() {
        this.http.get('./assets/pattern.json').subscribe((res) => {
            localStorage.setItem(this.storageData.patternList, JSON.stringify(res));
        },
            (error: HttpErrorResponse) => {
                this.snackbar.error('Failed to load patern data');
            });
    }

    // grid row colors and spinner, progress based on status
    statusTypes() {
        this.http.get('./assets/statusType.json').subscribe((res) => {
            localStorage.setItem(this.storageData.statusTypesList, JSON.stringify(res));
        },
            (error: HttpErrorResponse) => {
                this.snackbar.error('Failed to load patern data');
            });
    }


    getRolesBySiteId(id) {
        let userRolesSiteIds = JSON.parse(localStorage.getItem(this.storageData.rolesSiteIds));
        this.rolesBySiteId = {};
        if (!this.checkNullOrUndefined(userRolesSiteIds)) {
            this.rolesBySiteId[id] = userRolesSiteIds[id];
            localStorage.setItem(this.storageData.rolesList, JSON.stringify(this.rolesBySiteId));
            this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
            this.clientData.Roles = this.rolesBySiteId[this.clientData.SiteId];
            localStorage.setItem(this.storageData.clientData, JSON.stringify(this.clientData));
        }
    }

    sideMenuObj(menus) {
        this.appRoutes = [];
        if (!checkNullorUndefined(menus)) {
            menus.forEach(element => {
                if (!checkNullorUndefined(element)) {
                    if (element.hasOwnProperty('Title')) {
                        if (element.hasOwnProperty('HasSubMenu') && element.HasSubMenu) {
                            const sub = [];
                            element.SubMenu.forEach(subMenu => {
                                if (subMenu.hasOwnProperty('Title') && subMenu.hasOwnProperty('RouterLink')) {
                                    if (!checkNullorUndefined(subMenu.Title) && !checkNullorUndefined(subMenu.RouterLink)) {
                                        sub.push({ label: subMenu.Title, Category: subMenu.Category, path: subMenu.RouterLink })
                                    }
                                }
                            });
                            this.sortSubArray(sub, "label");
                            if (!checkNullorUndefined(element.Title)) {
                                this.appRoutes.push({ label: element.Title, path: null, children: sub });
                            }
                        } else if (!checkNullorUndefined(element.Title) && element.hasOwnProperty('RouterLink') &&
                            !checkNullorUndefined(element.RouterLink)) {
                            this.appRoutes.push({ label: element.Title, Category: element.Category, path: element.RouterLink });
                        }
                    }
                }
            });
        }
    }

     sortSubArray(array, property, direction?) {
        direction = direction || 1;
        array.sort(function compare(a, b) {
            let comparison = 0;
            if (a[property] > b[property]) {
                comparison = 1 * direction;
            } else if (a[property] < b[property]) {
                comparison = -1 * direction;
            }
            return comparison;
        });
        return array; // Chainable
    }


    getMenuItems(showUserProfile?) {
        this.spinner.show();
        this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
        const UserRolesList = JSON.parse(localStorage.getItem(this.storageData.rolesList));
        this.rolesList.Roles = UserRolesList;
        const requestObj = { ClientData: this.clientData, RolesList: this.rolesList };
        const url = String.Join('/', this.apiConfigService.navbarMenuAPI);
        this.apiService.apiPostRequest(url, requestObj)
            .subscribe(response => {
                const res = response.body;
                if (!this.checkNullOrUndefined(res) && res.Status === this.statusCode.pass) {
                    this.menu = res.Response;
                    this.sideMenuObj(res.Response);
                    localStorage.setItem(this.storageData.menu, JSON.stringify(this.menu));
                    if (showUserProfile == CommonEnum.no) {
                        this.router.navigate(['dashboard']);
                    } else if (showUserProfile == CommonEnum.yes) {
                        this.router.navigate(['user-profile']);
                    } else {
                        this.router.navigate(['dashboard']);
                    }
                    if (this.checkNullOrUndefined(showUserProfile)) {
                        localStorage.setItem(this.storageData.userProfileChanged, 'true');
                    }
                    this.spinner.hide();
                }
                else if (!this.checkNullOrUndefined(res) && res.Status === this.statusCode.fail) {
                    if (!this.checkNullOrUndefined(showUserProfile)) {
                        localStorage.clear();
                    }
                    this.spinner.hide();
                    this.appErrService.alertMsg = res.StatusMessage;
                }
            }, erro => {
                if (!this.checkNullOrUndefined(showUserProfile)) {
                    localStorage.clear();
                }
                this.spinner.hide();
                this.appErrService.handleAppError(erro, false);
            });
    }


    //Object Comparsion
    IsObjectsMatch(mainObject: any, cloneObject: any) {
        return (JSON.stringify(mainObject) === JSON.stringify(cloneObject));
    }

    //timeOutConfig
    timeOutConfig() {
        let timeOutConfiguration: any = JSON.parse(localStorage.getItem(this.storageData.timeOutConfig));
        if (!this.checkNullOrUndefined(timeOutConfiguration)) {
            let isUserExist: any;
            this.clientData = JSON.parse(localStorage.getItem(this.storageData.clientData));
            //UserExist In Exclusion or not
            if (!this.checkNullOrUndefined(this.clientData) && this.clientData.LoggedInUser) {
                let userName = this.decrypt(this.securityKey, this.clientData.LoggedInUser);
                isUserExist = timeOutConfiguration.Exclusion && timeOutConfiguration.Exclusion.find(e => e.user == userName);
            }
            if (!this.checkNullOrUndefined(isUserExist)) {
                if (isUserExist.user && isUserExist.time) {
                    this.timeOutSetting(isUserExist.time, timeOutConfiguration.waitngTime);
                }
            } else {
                //UserExist In Clients or not
                isUserExist = timeOutConfiguration.Clients && timeOutConfiguration.Clients[this.clientData.ClientId];
                if (isUserExist && isUserExist.length > 0) {
                    let isExistSiteId = isUserExist.find(s => s.siteid == this.clientData.SiteId);
                    if (!this.checkNullOrUndefined(isExistSiteId)) {
                        if (isExistSiteId.time) {
                            this.timeOutSetting(isExistSiteId.time, timeOutConfiguration.waitngTime);
                        }
                    } else {
                        this.timeOutSetting(timeOutConfiguration.Default, timeOutConfiguration.waitngTime);
                    }
                } else {
                    this.timeOutSetting(timeOutConfiguration.Default, timeOutConfiguration.waitngTime);
                    // timeOutConfiguration.Default
                }
            }
        }
    }

    timeOutSetting(idleTimeOut, waitngTime) {
        this.masterPageService.timmerCount = undefined;
        this.userIdle.stopWatching();
        //this.userIdle.setConfigValues({ idle: 60, timeout: 1, ping: 0 });
        this.userIdle.setConfigValues({ idle: idleTimeOut, timeout: waitngTime, ping: 0 });

        //Start watching for user inactivity.
        this.userIdle.startWatching();

        // Start watching when user idle is starting.
        this.userIdle.onTimerStart().subscribe((count) => {
            if (!this.checkNullOrUndefined(count)) {
                if (localStorage.getItem(this.storageData.timmerCount) <= sessionStorage.getItem(this.storageData.timmerCount)) {
                    if (count === 1 && this.checkNullOrUndefined(this.masterPageService.timmerCount)) {
                        this.masterPageService.timmerCount = count;
                        this.dialogRef = this.dialog.open(RmtimmeroutComponent, { hasBackdrop: true, disableClose: true, panelClass: 'dialog-width-sm', data: { waitngTime: waitngTime } });
                        this.dialogRef.afterClosed().subscribe((data) => {
                          if (data) {
                            if (data == this.storageData.continue) {
                                this.masterPageService.timmerCount = undefined;
                                this.userIdle.resetTimer();
                            } else {
                                this.masterPageService.logout();
                            }
                            if (!this.checkNullOrUndefined(this.dialogRef)) {
                                this.dialogRef.close();
                            }
                        }
                    })
                    } else {
                        this.masterPageService.timmerCount = count;
                    }
                } else {
                    this.userIdle.resetTimer();
                    this.masterPageService.timmerCount = undefined;
                    if (!this.checkNullOrUndefined(this.dialogRef)) {
                        this.dialogRef.close();
                    }
                }
            }
        });

        // Start watch when time is up.
        this.userIdle.onTimeout().subscribe(() => {
            if (localStorage.getItem(this.storageData.timmerCount) <= sessionStorage.getItem(this.storageData.timmerCount)) {
                this.masterPageService.logout();
                if (!this.checkNullOrUndefined(this.dialogRef)) {
                    this.dialogRef.close();
                }
            }
        });
    }

    //The set method is use for encrypt the value
    encrypt(value: string, securityKey) {
        if (value && securityKey) {
            let key = CryptoJS.enc.Utf8.parse(securityKey);
            let iv = CryptoJS.enc.Utf8.parse(securityKey);
            var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value), key,
                {
                    keySize: 128 / 8,
                    iv: iv,
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });

            return encrypted.toString();
        }
    }

    //The get method is use for decrypt the value.
    decrypt(keys, value) {
        if (keys && value) {
            var key = CryptoJS.enc.Utf8.parse(keys);
            var iv = CryptoJS.enc.Utf8.parse(keys);
            var decrypted = CryptoJS.AES.decrypt(value, key, {
                keySize: 128 / 8,
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            });
            return decrypted.toString(CryptoJS.enc.Utf8);
        }
    }
}
