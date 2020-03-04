import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import template from './Employees.vue';
import Paginate from 'vuejs-paginate';
import EmployeeProfile from '../../components/employeeProfile';
import { getAgency, getSavedEmployee, commitSetSavedEmployee } from '../../store/modules/adminModule';
import {
  EmployeeModel,
  IEmployeeModel,
  IEntitySearchResult,
  IEmployeeLightModel,
  EmployeeRole,
  $authUser,
  $agencies,
  ILicensingOptionsModel,
  LicensingOptionsModel,
  $newObj,
  $agency,
  $employee, EntitySearchQueryDeletedStatus,
} from '@immosparrow/cockpit-api-v2';
import store from '../../store';
import * as globalState from '../../store/modules/globalStatesModule';
import ConfirmModal from '../../components/modal/confirmModal';
import RedirectMixin from '../../mixins/redirect';
import { commitSetEmployeeContext, getEmployeeContext,
  commitSetNoEmployeeStatus, commitSetSuperviseMode } from '../../store/modules/authStatesModule';
import modal from '../../components/modal';
import AgencyMapComponent from '../../components/map/agency';

@Component({
  mixins: [template, RedirectMixin],
  components: {
    EmployeeProfile,
    Paginate,
    ConfirmModal,
    modal,
    AgencyMapComponent,
  },
})
export default class Employees extends Vue {

  employees: IEntitySearchResult<IEmployeeLightModel> = null;
  employee: IEmployeeModel = new EmployeeModel;
  newEmployee: EmployeeModel = new EmployeeModel();

  activeNo: number = 0;
  inActiveNo: number = 0;
  pages: number = 0;
  employeesNo: number = 0;
  searchStr: string = '';
  searchLoading: boolean = false;
  searchFinished: boolean = false;
  addingEmployee: boolean = false;
  loadElement: boolean = false;
  perPage: number = 10;
  pageNum: number = 0;
  selectedIndex: number = -1;
  loading: boolean = false;
  showModal = false;
  firstLoadElement: boolean = false;
  removeEmployeeData: IEmployeeLightModel = null;
  removeText = 'Are you sure you want to delete this employee?';
  $refs: {
    employeesPagination: any,
  };
  showDeleted: boolean = false;

  showSuperviseModal: boolean = false;
  showSearchAreas: boolean = false;

  created() {
    this.loadEmployees();
    this.$on('showSearchAreas', (value: boolean) => {
      this.showSearchAreas = value;
    });
  }

  closeEmployee() {
    this.employee = new EmployeeModel();
    globalState.commitProfileRightSidebar(store, false);
    this.selectedIndex = -1;
  }
  closeNewEmployee() {
    this.addingEmployee = false;
    globalState.commitProfileRightSidebar(store, false);
    this.employee = new EmployeeModel();
  }

  deleteEmployee(employee: IEmployeeLightModel) {
    this.removeEmployeeData = employee;
    this.showModal = true;
  }

  closeModal() {
    this.removeEmployeeData = null;
    this.showModal = false;
  }

  async removeEmployee() {
    if (await $employee(this.removeEmployeeData.id).delete('')) {
      const goToPage = this.employees.items.length > 1 ? this.pageNum += 1 : this.pageNum;
      if (this.removeEmployeeData.isEnabled) {
        this.activeNo = this.activeNo - 1;
      } else {
        this.inActiveNo = this.inActiveNo - 1;
      }
      this.nextPage(goToPage, undefined, true);
    }
    this.showModal = false;
  }

  deleted() {
    this.showDeleted = !this.showDeleted;
    this.nextPage(0, -1);
  }

  loadEmployees() {
    const self = this;
    self.loading = true;
    const agency = getAgency(store);
    $agency(agency.id).findEmployees({
      pageSize: this.perPage,
      page: 0,
      text: '',
      sort: '+lastName',
    }).then((result) => {
      const res = result;
      this.employees = res;
      this.pages = res.pageCount;
      this.activeNo = res.entityCounts.enabledCount;
      this.inActiveNo = res.entityCounts.totalCount - this.activeNo;

      const employee = getSavedEmployee(store);
      if (employee) {
        if (employee.created) {
          employee.created.time = new Date(employee.created.time);
        }
        if (employee.updated) {
          employee.updated.time = new Date(employee.updated.time);
        }
        commitSetSavedEmployee(store, undefined);
        this.selectedIndex = 0;
        this.employee = employee;
        this.firstLoadElement = true;
        globalState.commitProfileRightSidebar(store, true);
      }
      $agencies.getLicensingOptions()
      .then((res) => {
        this.licensingOptions = res;
        self.loading = false;
      });

      if (!this.searchStr) {
        setTimeout(() => {
          self.searchLoading = false;
        },         500);
      }
    });

  }

  async unDelete(id: string) {
    const result = await $employee(id).undelete();
    if (result) {
      if (this.employee.id === id) {
        this.employee = new EmployeeModel();
      }
      this.nextPage(this.pageNum, undefined, true);
      this.$notify({
        text: 'Employee was successfully restored',
        group: 'actions',
        type: 'success',
        duration: 2500,
      });
    }
  }

  @Watch('perPage')
  reloadWithNewNumber() {
    this.nextPage(this.pageNum, undefined);
  }

  nextPage(pageNum: number, index: number, deleteLoad?: boolean) {
    if (!deleteLoad) {
      this.loading = true;
    }

    if (pageNum === 0) {
      this.pageNum = 0;
    } else {
      this.pageNum = pageNum - 1;
    }
    if (this.searchStr !== '') {
      return this.searchFor(this.pageNum);
    }

    this.$refs.employeesPagination.selected = this.pageNum;

    setTimeout(() => {
      const data = {
        pageSize: this.perPage,
        page: this.pageNum,
        text: '',
        sort: '+lastName',
        deletedStatus: EntitySearchQueryDeletedStatus.Existing,
      };

      if (this.showDeleted) {
        data.deletedStatus = EntitySearchQueryDeletedStatus.Deleted;
      }

      const agency = getAgency(store);
      $agency(agency.id).findEmployees(data)
        .then((res) => {
          this.employees = res;
          this.pages = res.pageCount;
          if (!deleteLoad) {
            this.loading = false;
          }
          this.removeEmployeeData = null;
        })
        .then(() => {
          this.removeEmployeeData = null;
          if (index !== undefined && index !== -1) {
            this.getEmployee(index);
          }
        });
    },         1000);
  }

  getEmployee(index: number) {
    this.loadElement = true;
    this.firstLoadElement = false;
    this.addingEmployee = false;
    this.selectedIndex = index;
    if (this.selectedIndex !== -1) {
      const id = this.employees.items[this.selectedIndex]['id'];
      $employee(id).get().then((res) => {
        this.employee = res;
        this.employees[index] = this.employee;
        globalState.commitProfileRightSidebar(store, true);
        this.loadElement = false;
      });
    }
  }

  nextItem (index: number, next: boolean) {
    this.loadElement = true;
    this.selectedIndex = index;
    if (next) {
      if (this.perPage - 1 === index) {
        let pgNum = this.pageNum;
        pgNum += 2;
        this.nextPage(pgNum, 0);
      } else {
        this.selectedIndex += 1;
      }
    } else {
      if (index === 0) {
        let pgNum = this.pageNum;
        pgNum -= 1;
        this.nextPage(pgNum, this.perPage - 1);
      } else {
        this.selectedIndex -= 1;
      }
    }
    this.getEmployee(this.selectedIndex);
  }

  searchFor(pageNum: number) {
    const self = this;
    self.searchFinished = false;
    this.searchLoading = true;

    let pNum = 0;
    if (pageNum > 0) {
      pNum = pageNum - 1;
    }

    const searchQuery = {
      text: self.searchStr,
      page: pNum,
      pageSize: this.perPage,
      deletedStatus: EntitySearchQueryDeletedStatus.Existing,
    };

    if (this.showDeleted) {
      searchQuery.deletedStatus = EntitySearchQueryDeletedStatus.Deleted;
    }

    if (self.searchStr) {
      $agency(getAgency(store).id).findEmployees(searchQuery)
      .then((result) => {
        const res = result;
        setTimeout(() => {
          self.employees = res;
          self.pages = res.pageCount;
          self.searchLoading = false;
          self.searchFinished = true;
          self.loading = false;
        },         500);
      });

    } else {
      self.loadEmployees();
    }
  }

  changePerPage(i: number) {
    // this.searchStr = "";
    this.perPage = i;
    this.pageNum = 0;
  }

  clearSearch() {
    this.searchStr = '';
    this.searchFinished = false;
    this.nextPage(0, -1);
  }

  addEmployee() {
    this.newEmployee = new EmployeeModel();
    this.addingEmployee = true;
    globalState.commitProfileRightSidebar(store, true);
  }

  checkEnd (index: number) {
    const idx = index + 1;
    const pgNum = this.pageNum + 1;
    if ((this.employees && this.employees.items[idx]) || pgNum !== this.pages) {
      return true;
    }
    return false;

  }
  getEmployeeRole (role: number) {
    if (role >= 0) {
      return EmployeeRole[role];
    }
    return '';
  }

  superviseEmployee (employee: IEmployeeLightModel) {
    const w = getEmployeeContext(store);
    if (!w || (w && w.employee.id !== employee.id)) {
      this.selectedEmployee = employee;
      this.showSuperviseModal = true;
    }
  }

  licensingOptions: ILicensingOptionsModel = $newObj(LicensingOptionsModel);
  getBundleName (bundleId: string) {
    let name: string = '';
    if (this.licensingOptions && this.licensingOptions.bundles) {
      this.licensingOptions.bundles.forEach((b) => {
        if (b.id === bundleId) {
          name = b.name;
        }
      });
    }
    return name;
  }

  selectedEmployee: IEmployeeLightModel = null;
  confirmSelectEmployee () {
    this.showSuperviseModal = false;
    commitSetEmployeeContext(store, null);
    const accessMode: number = 2; // supervisor
    $authUser.setCurrentEmployee(this.selectedEmployee.id, accessMode);
    $authUser.getCurrentWorkspaceContext()
      .then((res) => {
        commitSetEmployeeContext(store, res);
        this.$root.$emit('currentEmployeeLoaded');
        commitSetNoEmployeeStatus(store, undefined);
        commitSetSuperviseMode(store, true);
        // this.$router.push({ name: 'Dashboard' });
      });
  }
}
