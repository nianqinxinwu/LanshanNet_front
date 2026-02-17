export default {
    onLoad(options) {
        const userinfo = this.$core ? this.$core.getUserinfo() : null;
        if (!userinfo || !userinfo.token) {
            uni.redirectTo({ url: '/pages/login/login' });
            return;
        }
    }
}
