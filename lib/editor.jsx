import DataStore from './store'

export default function() {
  this.db = new DataStore();
  console.log(this.db.config);
}
