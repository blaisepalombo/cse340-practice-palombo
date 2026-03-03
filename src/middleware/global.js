/**
 * Helper function to get the current greeting based on the time of day.
 */
const getCurrentGreeting = () => {
  const currentHour = new Date().getHours();

  if (currentHour < 12) return 'Good Morning!';
  if (currentHour < 18) return 'Good Afternoon!';
  return 'Good Evening!';
};

/**
 * Express middleware helper that adds head asset management functionality.
 * - res.addStyle(css, priority)
 * - res.addScript(js, priority)
 * - res.locals.renderStyles()
 * - res.locals.renderScripts()
 */
const setHeadAssetsFunctionality = (res) => {
  res.locals.styles = [];
  res.locals.scripts = [];

  res.addStyle = (css, priority = 0) => {
    res.locals.styles.push({ content: css, priority });
  };

  res.addScript = (js, priority = 0) => {
    res.locals.scripts.push({ content: js, priority });
  };

  res.locals.renderStyles = () => {
    return res.locals.styles
      .sort((a, b) => b.priority - a.priority)
      .map((item) => item.content)
      .join('\n');
  };

  res.locals.renderScripts = () => {
    return res.locals.scripts
      .sort((a, b) => b.priority - a.priority)
      .map((item) => item.content)
      .join('\n');
  };
};

/**
 * Middleware to add local variables to res.locals for use in all templates.
 */
const addLocalVariables = (req, res, next) => {
  setHeadAssetsFunctionality(res);

  res.locals.currentYear = new Date().getFullYear();
  res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
  res.locals.queryParams = { ...req.query };
  res.locals.greeting = `<p>${getCurrentGreeting()}</p>`;

  const themes = ['blue-theme', 'green-theme', 'red-theme'];
  res.locals.bodyClass = themes[Math.floor(Math.random() * themes.length)];

  // ✅ Auth locals used by views
  res.locals.isLoggedIn = Boolean(req.session && req.session.user);
  res.locals.user = req.session && req.session.user ? req.session.user : null;

  next();
};

export { addLocalVariables };