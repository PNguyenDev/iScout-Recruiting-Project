<template>
  <b-container>
    <b-row align-h="between">
      <b-col cols="4"><h2 v-if="guests">Guest Count: {{ getTotalGuestCount() }}</h2></b-col>
      <b-col cols="2">
        <b-button
          variant="success"
          class="float-right"
          v-on:click="openGuestInfoModal(null)">Add A Guest</b-button>
      </b-col>
    </b-row>
    <br />
    <b-table striped hover :items="guests" :fields="fields">
      <template v-slot:cell(actions)="guest">
        <b-button v-on:click="openGuestInfoModal(guest.item)">Edit</b-button>
        <b-button class="ml-2" variant="danger" v-on:click="confirmGuestDelete(guest.item)">Delete</b-button>
      </template>
    </b-table>
    <b-modal
      id="edit-guest-info"
      ref="edit-guest-info"
      title="Guest Information"
      @ok="saveGuestRecord"
      ok-title="Save"
      :ok-disabled="disableGuestSave"
      >
      <b-form >
          <label for="email">Email Address:</label>
          <b-form-input
            id="email"
            v-model="guestInfoForm.email"
            type="email"
            placeholder="Enter email"
            required
          ></b-form-input>
          <label for="tickets" class="mt-2">Number of Tickets:</label>
          <b-form-input
            id="tickets"
            v-model="guestInfoForm.tickets"
            type="number"
            min="1"
            placeholder="Enter Number of tickets needed"
            required
          ></b-form-input>
      </b-form>
    </b-modal>
  </b-container>
</template>

<script>
  import GuestRepository from '../guest-repository';
  import Guest from './lib/guest.js';

  const repo = new GuestRepository(),
    fieldNames = [
      {
        key: 'actions',
        sortable: false
      },
      {
        key: 'email',
        sortable: true,
        label: 'Email Address',
      },
      {
        key: 'tickets',
        sortable: true,
        label: 'Number Of Tickets',
      },
    ];

  export default {
    computed: {
      disableGuestSave() {
        return !this.guestInfoForm.email || !this.guestInfoForm.tickets;
      }
    },
    data: () => {
      return {
        fields: fieldNames,
        guests: [],
        guestToEdit: new Guest(),
        guestInfoForm: new Guest(),
        originalGuests: []
      }
    },
    methods: {
      confirmGuestDelete(guestData) {
        this.$bvModal.msgBoxConfirm(`Are you sure you want to delete the guest record for ${guestData.email}.`, {
          title: 'Please Confirm',
          okVariant: 'danger',
          okTitle: 'YES',
          cancelTitle: 'NO',
          centered: true,
          size: 'lg'
        }).then((clicked) => {
            if (clicked === true)
              this.deleteGuestRecord(guestData.email);
        });
      },
      deleteGuestRecord(emailToRemove) {
        this.guests = this.guests.filter((guest) => { return guest.email !== emailToRemove });
      },
      findGuestRecord(emailToFind) {
        return this.guests.find(guest => { return guest.email === emailToFind });
      },
      getTotalGuestCount() {
        let numberOfGuests = 0;
        if (this.guests && this.guests.length > 0) {
          this.guests.forEach(guest => {
            numberOfGuests += guest.tickets;
          });
        }
        return numberOfGuests;
      },
      openGuestInfoModal(guestData) {
        if(guestData === null)
          guestData = new Guest();
        this.guestToEdit = guestData;
        this.guestInfoForm = new Guest(guestData.email, guestData.tickets);
        this.$bvModal.show('edit-guest-info');
      },
      resetGuestList() {
        this.guests = this.originalGuests;
      },
      async saveGuestRecord() {
        let gustRecordFound = this.findGuestRecord(this.guestToEdit.email);
        if (this.guestInfoForm.tickets !== '')
          this.guestInfoForm.tickets = parseInt(this.guestInfoForm.tickets);
        if (gustRecordFound) {
          gustRecordFound.email = this.guestInfoForm.email;
          gustRecordFound.tickets = this.guestInfoForm.tickets;
        } else {
          this.guests.push(this.guestInfoForm);
        }
        await repo.save(this.guests);
      }
    },
    async created () {
      await repo.reset();
      let response = await repo.load();
      if (response && response.length > 0) {
        response.forEach(guest => {
          guest.tickets = parseInt(guest.tickets);
        });
      }
      this.guests = response;
      this.originalGuestList = response;
    }
  }
</script>