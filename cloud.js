/* The publishable key is public. Access requires the private key AND database membership. */
const WishlistCloud = (() => {
  const url = "https://gqkubboufojjjmlzcxdu.supabase.co";
  const key = "sb_publishable_giVSbWaVDO7d8kicRNqEnQ_GrPjr2us";
  const account = "bob@space-wishlist.invalid"; // Reserved, non-deliverable account identifier.
  let client;
  function db() {
    if (!window.supabase) throw new Error("The connection library could not load. Check your connection and reload.");
    return client ||= window.supabase.createClient(url, key, {
      auth: { storageKey: "space-wishlist-auth-v2", detectSessionInUrl: false },
      global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20000) }) }
    });
  }
  function check(error) {
    if (error) {
      const failure = new Error(error.message || "The cloud request failed. Please try again.");
      failure.code = error.code;
      throw failure;
    }
  }
  return {
    onLock(callback) {
      if (client) client.auth.onAuthStateChange(event => { if (event === "SIGNED_OUT") callback(); });
    },
    async initialize() {
      const params = new URLSearchParams(location.hash.slice(1));
      const access = params.get("access");
      if (access) {
        history.replaceState(null, "", location.pathname + location.search);
        await this.unlock(access);
      }
      const { data, error } = await db().auth.getSession();
      check(error);
      return Boolean(data.session);
    },
    async unlock(password) {
      const { error } = await db().auth.signInWithPassword({ email: account, password });
      check(error);
    },
    async lock() {
      const { error } = await db().auth.signOut({ scope: "local" });
      check(error);
    },
    async list() {
      const { data, error } = await db().rpc("space_wishlist_list");
      check(error);
      if (!Array.isArray(data)) throw new Error("The cloud returned an invalid wishlist.");
      return data;
    },
    async mutate(request) {
      const { data, error } = await db().rpc("space_wishlist_mutate", { request });
      check(error);
      if (!data?.id) throw new Error("The cloud did not confirm this change. Retry to check it safely.");
      return data;
    }
  };
})();
