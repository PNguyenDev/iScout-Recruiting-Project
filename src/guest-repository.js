import Guest from './components/lib/guest.js';

const defaultGuests = [
  new Guest('gangnam-style@psy.com', 1),
  new Guest('harlem.shake@baauer.com', 8),
  new Guest('black.beatles@skrillex.com', 3)
];
const KEY = 'iscout-recruit-project.guests';

export default class GuestRepository {
  load() {
    return new Promise(resolve => {
      setTimeout(() => {
        try {
          const json = localStorage.getItem(KEY);
          if (!json) throw 'no data found';
          resolve(JSON.parse(json));
        }catch (e) {
          resolve(defaultGuests);
        }
      }, 1000);
    });
  }
  save(guests) {
    return new Promise(resolve => {
      setTimeout(() => {
        try {
          localStorage.setItem(KEY, JSON.stringify(guests));
        }catch (e) {
          // noop
        }
        resolve();
      }, 1000);
    });
  }
  reset() {
    return new Promise(resolve => {
      setTimeout(() => {
        localStorage.removeItem(KEY);
        resolve();
      }, 1000);
    });
  }
}
