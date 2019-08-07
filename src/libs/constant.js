let timeouts;
if (localStorage.getItem('pm_slow_mode')) {
    // eslint-disable-next-line
    console.log('Slow mode: ON');
    timeouts = {
        inUtils: 700,
        mainLoop: 2000,
        retry: 3000,
        getUser: 200
    }
} else {
    timeouts = {
        inUtils: 500,
        mainLoop: 1000,
        retry: 2000,
        getUser: 100
    }
}

export { timeouts };