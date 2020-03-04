import Vue from 'vue';
import { Component, Prop, Watch } from 'vue-property-decorator';
import template from './template.vue';
import * as globalState from '../../../store/modules/globalStatesModule';
import store from '../../../store';
import GetTimeUtc from '../../../components/getTimeUtc';
import ObjectTab from './objectTab';
import ContactTab from './contactTab';
import BasicInfo from '../basicInfo';
import activity from '../../../components/activity';
import {
  formatDate,
  getActivityType,
  getDuration,
} from '../../../components/sharedFunctions';
import {
  dispatchGetPubById,
} from '../../../store/modules/searchModule';
import {
    IPipelineEntryLightModel,
    PipelineEntryStatus,
    PipelineStatsModel,
    IPipelineModel,
    IPubAvailability,
    mval as val,
    IPubModel,
    $pipeline,
    $pipelineEntry,
    PipelineEntryActivityStatus,
    PipelineEntryActivityLightModel,
    PipelineEntryNoteLightModel,
    $newObj,
    PubLightModel,
    IPipelineEntryNoteLightModel,
    PipelineEntryEntityModifiableInfo,
    PubAvailability,
    PubAvailabilityType,
    ContactInfo,
    ModifiableAddress,
    ModifiableAddressGovId,
    PipelineEntryActivityType,
    ModifiableAddressLandId,
    IPipelineEntryActivityModel,
    PipelineEntryEntityContactInfo,
    PipelineEntryEntityBuildingInfo,
    $pipelineEntryActivity,
  } from '@immosparrow/cockpit-api-v2';
import ActivityDetails from '../../activities/ActivityDetails/';
import NoteDetails from '../../activities/NoteDetails/';
import _ from 'lodash';
import { mixins } from 'vue-class-component';
import FeatureChecks from '@/mixins/featureChecks';

@Component({
  name: 'EntryDetails',
  mixins: [template],
  components: {
    GetTimeUtc,
    ContactTab,
    ObjectTab,
    BasicInfo,
    activity,
    ActivityDetails,
    NoteDetails,
  },
})

export default class EntryDetails extends mixins(FeatureChecks) {

  @Prop({ default: null })
  item: IPipelineEntryLightModel;

  @Prop({ default: null })
  pipeline: IPipelineModel;

  @Prop({ default: null })
  activitySection: string;

  selectedItem: IPubModel;

  formatDate: Function = formatDate;
  getActivityType: Function = getActivityType;
  val: Function = val;
  getDuration: Function = getDuration;

  sectionLifetime: boolean = true;
  sectionAddToDeal: boolean = true;
  sectionActivities: boolean = true;
  lifeTimeAvgWon: PipelineStatsModel = null;
  changingStatus: boolean = false;

  activityType: object = {
    None: true,
    Call: false,
    Meeting: false,
    Tasks: false,
    Deadline: false,
    Email: false,
    Lunch: false,
    Changelog: false,
  };

  tabsItem: object = {
    overview: true,
    object: false,
    contact: false,
  };
  tabsDetails: object = {
    showNote: true,
    showActivity: false,
    showFile: false,
  };
  activityNote: string = '';
  activityTimeline: [
    { name: 'Pending', items: any[] },
    { name: 'Done', items: any[] }
   ] = [
    { name: 'Pending', items: [] },
    { name: 'Done', items: [] },
   ];

  activityFilter: string = 'None';
  refresh: boolean = false;

  ownersTemp: any = ['Juliane Schultz', 'Sarah Koehler', 'Ulrich Lang'];

  selectedActivity: IPipelineEntryActivityModel = null;
  selectedNote: IPipelineEntryNoteLightModel = null;

  activities: PipelineEntryActivityLightModel[] = [];
  notes: PipelineEntryNoteLightModel[] = [];

  get filteredActivities () {
    this.activityTimeline[0].items.sort((a, b) => {
      const aDate = a.timeUtc || a.createdTime;
      const bDate = b.timeUtc || b.createdTime;
      return aDate - bDate;
    }).reverse();
    this.activityTimeline[1].items.sort((a, b) => {
      const aDate = a.timeUtc || a.createdTime;
      const bDate = b.timeUtc || b.createdTime;
      return aDate - bDate;
    }).reverse();
    return this.activityTimeline;
  }

  get getLifetimePercentageBar1 () {
    let res = '100%';
    if (this.lifeTimeAvgWon && this.lifeTimeAvgWon.wonAverageLifetimeDays) {
      const days = this.getDuration(this.item.createdTime, null);
      if (days < this.lifeTimeAvgWon.wonAverageLifetimeDays) {
        res = `${days * 100 / this.lifeTimeAvgWon.wonAverageLifetimeDays}%`;
      }
    }
    return res;
  }

  get getLifetimePercentageBar2 () {
    let res = '0%';
    if (this.lifeTimeAvgWon && this.lifeTimeAvgWon.wonAverageLifetimeDays) {
      const days = this.getDuration(this.item.createdTime, null);
      if (days >= this.lifeTimeAvgWon.wonAverageLifetimeDays) {
        res = `${this.lifeTimeAvgWon.wonAverageLifetimeDays * 100 / days}%`;
      } else {
        res = '100%';
      }
    }
    return res;
  }

  get isOwner () {
    return !this.item.isDeleted &&
      this.item.status === PipelineEntryStatus.InProgress &&
      this.val(this.item, (item: IPipelineEntryLightModel) => item.assignedEmployee.employee.id) === this.currentEmployee.id;
  }

  @Watch('item', { immediate: true })
  loadPublication(val: IPipelineEntryLightModel, oldVal: IPipelineEntryLightModel) {
    if (!oldVal || (oldVal && oldVal.id !== val.id)) {
      if (this.item.publication) {
        this.refresh = true;
        dispatchGetPubById(store, this.item.publication.id)
          .then((res) => {
            this.item.publication = _.cloneDeep(res);
            this.loadEntryDetails();
            if (res) {
              this.selectedItem = res;
              this.populateModifiableInfo();
            }
          });
      }
    }
  }

  created () {
    this.$root.$on('updateActivityTimeline', (item: any) => {
      this.activityTimeline[0].items.splice(this.activityTimeline[0].items.indexOf(item), 1);
      this.activityTimeline[1].items.push(item);
    });
    this.$root.$on('refreshActivities', () => {
      this.getTimeline(this.item.id, this.activitySection);
    });
  }

  beforeDestroy () {
    this.$root.$off('updateActivityTimeline');
    this.$root.$off('refreshActivities');
  }

  loadEntryDetails () {
    if (this.activitySection === 'addActivity') {
      this.showTabs('tabsDetails', 'showActivity');
      const el = document.getElementById(this.activitySection);
      this.$nextTick(() => {
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
    this.getTimeline(this.item.id, this.activitySection);
    this.lifeTimeAvgWon = null;
    if (this.pipeline && this.pipeline.id) {
      $pipeline(this.pipeline.id).getStats()
        .then((res) => {
          this.lifeTimeAvgWon = res;
        });
    }
  }

  showTabs(tab: string, tabItem: string) {
    for (const i in this[tab]) {
      if (i === tabItem) {
        this[tab][i] = true;
      } else {
        this[tab][i] = false;
      }
    }
  }

  createNote (form: string) {
    this.$validator.validateAll(form).then((result) => {
      if (result) {
        $pipelineEntry(this.item.id).createNote({ content: this.activityNote })
          .then((res) => {
            this.getTimeline(this.item.id, null);
            this.activityNote = '';
          });
      }
    });
  }

  getTimeline(id: string, divId: string) {
    this.activities = [];
    this.notes = [];
    this.activityTimeline[0].items = [];
    this.activityTimeline[1].items = [];

    $pipelineEntry(id).getNotes()
      .then((result) => {
        this.notes = result;
        $pipelineEntry(id).getActivities()
          .then((res) => {
            this.activities = res;
            this.formatTimeline();
            if (divId === 'viewAll') {
              const el = document.getElementById(divId);
              this.$nextTick(() => {
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              });
            }
          });
      });
  }

  setActivityType(tab: string) {
    for (const i in this.activityType) {
      this.activityType[i] = i === tab;
    }
    this.activityFilter = tab;
    this.activityTimeline[0].items = [];
    this.activityTimeline[1].items = [];
    this.formatTimeline();
  }

  formatTimeline() {
    const all: any[] = [];
    this.activities.forEach((a) => {
      if (a.type === PipelineEntryActivityType[this.activityFilter] || PipelineEntryActivityType[this.activityFilter] === PipelineEntryActivityType.None) {
        all.push(a);
      }
    });
    this.notes.forEach((n) => {
      all.push(n);
    });
    all.forEach((item) => {
      if (item.status === PipelineEntryActivityStatus.Pending) {
        this.activityTimeline[0].items.push(item);
      } else {
        this.activityTimeline[1].items.push(item);
      }
    });
    this.refresh = false;
  }

  checkActivity (item: any) {
    this.changeStatus(item);
  }

  changeStatus (item: any) {
    this.changingStatus = true;
    item.status === PipelineEntryActivityStatus.Pending ? item.status = PipelineEntryActivityStatus.Completed : item.status = PipelineEntryActivityStatus.Pending;
    $pipelineEntryActivity(item.id).updateStatus(item.status)
      .then((res: boolean) => {
        this.changingStatus = false;
        if (res) {
          this.$root.$emit('refreshActivityOverdue');
          this.$root.$emit('refreshActivitiesList');
          if (item.status === PipelineEntryActivityStatus.Completed) {
            this.activityTimeline[0].items.splice(this.activityTimeline[0].items.indexOf(item), 1);
            this.activityTimeline[1].items.push(item);
          } else if (item.status === PipelineEntryActivityStatus.Pending) {
            this.activityTimeline[1].items.splice(this.activityTimeline[1].items.indexOf(item), 1);
            this.activityTimeline[0].items.push(item);
          }
          this.$emit('refreshSelectedEntry', this.activityTimeline[0].items.length);
        }
      });
  }

  createActivity (newActivity: IPipelineEntryActivityModel) {
    $pipelineEntry(this.item.id).createActivity(newActivity)
      .then((res) => {
        this.getTimeline(this.item.id, null);
        this.$emit('refreshSelectedEntry', this.activityTimeline[0].items.length);
        this.$root.$emit('refreshActivityOverdue');
      });
  }

  populateModifiableInfo () {
    this.item.name = this.item.name || this.selectedItem.primaryInfo.basicInfo.title;

    if (!this.item.entityModifiableInfo) {
      this.item.entityModifiableInfo = $newObj(PipelineEntryEntityModifiableInfo);
      this.item.entityModifiableInfo.address = this.item.entityModifiableInfo.address || $newObj(ModifiableAddress);
      this.item.entityModifiableInfo.contactInfo = this.item.entityModifiableInfo.contactInfo || $newObj(PipelineEntryEntityContactInfo);
      this.item.entityModifiableInfo.buildingInfo = this.item.entityModifiableInfo.buildingInfo || $newObj(PipelineEntryEntityBuildingInfo);
      this.item.entityModifiableInfo.address.govId = this.item.entityModifiableInfo.address.govId || $newObj(ModifiableAddressGovId);
      this.item.entityModifiableInfo.address.landId = this.item.entityModifiableInfo.address.landId || $newObj(ModifiableAddressLandId);
      this.item.entityModifiableInfo.contactInfo.address = this.item.entityModifiableInfo.contactInfo.address || $newObj(ModifiableAddress);
      this.item.entityModifiableInfo.contactInfo.contactInfo = this.item.entityModifiableInfo.contactInfo.contactInfo || $newObj(ContactInfo);

      this.item.entityModifiableInfo.address.street = this.item.entityModifiableInfo.address.street || this.selectedItem.address.street;
      this.item.entityModifiableInfo.address.streetNumber = this.item.entityModifiableInfo.address.streetNumber || this.selectedItem.address.streetNumber;
      this.item.entityModifiableInfo.address.zip = this.item.entityModifiableInfo.address.zip || this.selectedItem.address.zip;
      this.item.entityModifiableInfo.address.locality = this.item.entityModifiableInfo.address.locality || this.selectedItem.address.locality;
      this.item.entityModifiableInfo.address.govId = this.item.entityModifiableInfo.address.govId || this.selectedItem.address.govId;
      this.item.entityModifiableInfo.address.landId = this.item.entityModifiableInfo.address.landId || this.selectedItem.address.landId;

      this.item.entityModifiableInfo.buildingInfo.roomCount = this.item.entityModifiableInfo.buildingInfo.roomCount ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.primaryInfo.layout.rooms.roomCount);

      this.item.entityModifiableInfo.buildingInfo.builtYear = this.item.entityModifiableInfo.buildingInfo.builtYear ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.primaryInfo.basicInfo.builtYearCalculated);

      this.item.entityModifiableInfo.buildingInfo.renovationYear = this.item.entityModifiableInfo.buildingInfo.renovationYear ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.primaryInfo.basicInfo.renovationYearCalculated);

      this.item.entityModifiableInfo.buildingInfo.areaLiving = this.item.entityModifiableInfo.buildingInfo.areaLiving ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.primaryInfo.layout.size.areaLiving);

      this.item.entityModifiableInfo.buildingInfo.areaUsable = this.item.entityModifiableInfo.buildingInfo.areaUsable ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.primaryInfo.layout.size.areaUsable);

      this.item.entityModifiableInfo.buildingInfo.areaProperty = this.item.entityModifiableInfo.buildingInfo.areaProperty ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.primaryInfo.layout.size.areaProperty);

      this.item.entityModifiableInfo.buildingInfo.floorNumber = this.item.entityModifiableInfo.buildingInfo.floorNumber ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.primaryInfo.location.floorNumber);

      this.item.entityModifiableInfo.buildingInfo.floorCount = this.item.entityModifiableInfo.buildingInfo.floorCount ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.primaryInfo.location.floorCount);

      this.item.entityModifiableInfo.buildingInfo.availabilityText = this.item.entityModifiableInfo.buildingInfo.availabilityText ||
      this.formatAvailableDate(this.selectedItem.primaryInfo.availability);

      this.item.entityModifiableInfo.contactInfo.address.street = this.item.entityModifiableInfo.contactInfo.address.street ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.address.street);
      this.item.entityModifiableInfo.contactInfo.address.zip = this.item.entityModifiableInfo.contactInfo.address.zip ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.address.zip);
      this.item.entityModifiableInfo.contactInfo.address.locality = this.item.entityModifiableInfo.contactInfo.address.locality ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.address.locality);
      this.item.entityModifiableInfo.contactInfo.address.streetNumber = this.item.entityModifiableInfo.contactInfo.address.streetNumber ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.address.streetNumber);
      this.item.entityModifiableInfo.contactInfo.address.countryCode = this.item.entityModifiableInfo.contactInfo.address.countryCode ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.address.countryCode);

      this.item.entityModifiableInfo.contactInfo.contactInfo.workPhone = this.item.entityModifiableInfo.contactInfo.contactInfo.workPhone ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.primaryInfo.contactInfo.phoneNumbers[0]);
      this.item.entityModifiableInfo.contactInfo.contactInfo.mobilePhone = this.item.entityModifiableInfo.contactInfo.contactInfo.mobilePhone ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.primaryInfo.contactInfo.mobilePhoneNumbers[0]);
      this.item.entityModifiableInfo.contactInfo.contactInfo.websiteUrl = this.item.entityModifiableInfo.contactInfo.contactInfo.websiteUrl ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.primaryInfo.contactInfo.websiteUrls[0]);
      this.item.entityModifiableInfo.contactInfo.contactInfo.email = this.item.entityModifiableInfo.contactInfo.contactInfo.email ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.primaryInfo.contactInfo.emailAddresses[0]);

      this.item.entityModifiableInfo.contactInfo.organizationName = this.item.entityModifiableInfo.contactInfo.organizationName ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.primaryInfo.organization.name);
      this.item.entityModifiableInfo.contactInfo.personalName = this.item.entityModifiableInfo.contactInfo.personalName ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.primaryInfo.person.name) ||
      this.val(this.selectedItem, (selectedItem: PubLightModel) => selectedItem.trackingInfo.publisherCalculated.primaryInfo.personOrOrganization.name);
    }
  }

  formatAvailableDate (availability: IPubAvailability) {
    if (availability) {
      if (this.val(availability, (availability: PubAvailability) => availability.availableDate.value.itemIndex === 1)) {
        return PubAvailabilityType[availability.availableDate.value.item1];
      }  if (this.val(availability, (availability: PubAvailability) => availability.availableDate.value.itemIndex === 2)) {
        return this.val(availability, (availability: PubAvailability) => availability.availableDate.value.item2, (item: Date) => this.formatDate(item), '');
      }
      return this.val(availability, (availability: PubAvailability) => availability.availableDate.text, '');
    }
    return '';
  }

  checkStatus(status: number) {
    return status === PipelineEntryActivityStatus.Completed;
  }

  getEntryStatus (status: number) {
    return PipelineEntryStatus[status];
  }

  openDetailView () {
    globalState.commitSetNextItem(store, false);
    globalState.commitShowRightSidebar(store, true);
  }

  closeActivityDetail () {
    this.selectedActivity = null;
  }

  loadActivityDetails (ac: any) {
    this.selectedActivity = _.cloneDeep(ac);
  }

  loadNoteDetails (note: any) {
    this.selectedNote = _.cloneDeep(note);
  }

  closeNoteDetail () {
    this.selectedNote = null;
  }

}
