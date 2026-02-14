const DEFAULT_ADMIN_CONFIG = { /* default values here */ };
const DEFAULT_USER = { /* default values here */ };

useEffect(() => {
    try {
        // existing logic for fetching adminConfig and activeUser
    } catch (error) {
        console.error('Error fetching data:', error);
        // Set defaults if there's an error
        setAdminConfig(DEFAULT_ADMIN_CONFIG);
        setActiveUser(DEFAULT_USER);
    }
}, []);