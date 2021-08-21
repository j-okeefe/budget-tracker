let db;
let budgetVersion;

// Create a new db request for a "budgetTracker" database.
const request = indexedDB.open('budgetTracker', budgetVersion || 1);

request.onupgradeneeded = function (e) {
  console.log('Upgrade needed in IndexDB');

  const { oldVersion } = e;
  const newVersion = e.newVersion || db.version;

  console.log(`DB Updated from version ${oldVersion} to ${newVersion}`);

  db = e.target.result;

  if (db.objectStoreNames.length === 0) {
    db.createObjectStore('deal', { autoIncrement: true });
  }
};

// Error
request.onerror = function (e) {
  console.log(`Woops! ${e.target.errorCode}`);
};

// Success
request.onsuccess = function (e) {
  console.log('success');
  db = e.target.result;

  if (navigator.onLine) {
    console.log('success');
    checkDatabase();
  }
};

// Retrieve existing transactions
function checkDatabase() {
    const transaction = db.transaction(['deal'], 'readwrite');
    const store = transaction.objectStore('deal');
    const getAll = store.getAll();
  
    getAll.onsuccess = function () {
      if (getAll.result.length > 0) {
        fetch('/api/transaction/bulk', {
          method: 'POST',
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          },
        })
          .then((response) => response.json())
          .then((res) => {
            if (res.length !== 0) {
              transaction = db.transaction(['deal'], 'readwrite');
              const currentStore = transaction.objectStore('deal');
  
              currentStore.clear();
            }
          });
      }
    };
  }
  
// Create transaction
const saveRecord = (record) => {
  const transaction = db.transaction(['deal'], 'readwrite');
  const store = transaction.objectStore('deal');

  store.add(record);
};

// Listen for app coming back online
window.addEventListener('online', checkDatabase);
