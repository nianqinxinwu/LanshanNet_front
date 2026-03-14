<script>
	export default {
		onLaunch: function() {

			let app = this;
			app.$core.onRequestComplete(function(ret, response) {
				if (ret && ret.code === 401) {
					if (app.$core.getUserinfo()) {
						app.$core.logout();
						uni.navigateTo({
							url: '/pages/login/login'
						});
						uni.showToast({
							title: '登录过期,请重新登录',
							icon: 'none'
						});
					}
				}
			});

			// 初始化IM WebSocket连接
			this.initImConnection();

		},

		methods: {
			/**
			 * 初始化IM WebSocket连接
			 * 只在用户已登录时连接
			 */
			initImConnection() {
				const userinfo = this.$core.getUserinfo();
				if (!userinfo || !userinfo.token) {
					console.log('[IM] 用户未登录，跳过WebSocket连接');
					return;
				}

				const wsUrl = this.globalData.wsUrl;
				if (!wsUrl) {
					console.error('[IM] WebSocket URL未配置');
					return;
				}

				console.log('[IM] 开始连接WebSocket:', wsUrl);

				this.$im.connect(
					wsUrl,
					'user',  // 用户类型
					userinfo.token,
					(data) => {
						console.log('[IM] WebSocket连接成功, 用户ID:', data.uid);
					}
				);
			},

			/**
			 * 断开IM WebSocket连接
			 * 用户登出时调用
			 */
			disconnectIm() {
				console.log('[IM] 断开WebSocket连接');
				this.$im.disconnect();
			}
		},
		globalData: {
			//小程序配置的接口请求域名，为项目部署的服务器路径
			appid: '',
			// apiBaseUri: "https://xiche.zzlanshan.site/api",
			// apiBaseUri: "http://localhost:8000/api",
			// apiBaseUri: "http://192.168.1.149:8000/api",
			// apiBaseUri: "http://192.168.3.236:8000/api",  // 旧配置
			// apiBaseUri: "http://192.168.3.19:8000/api",  // 本地测试 - 2026-03-02 (测试通过✅)
			apiBaseUri: "https://one.zzlanshan.site/api",  // 线上环境 ✅

			// WebSocket配置 - IM即时通讯
			// wsUrl: "ws://192.168.3.19:8282",  // 本地测试
			wsUrl: "wss://one.zzlanshan.site/wss",  // 线上环境 (WSS加密) ✅

			//web目录
            webDir:'/web/',
			////前端上传图片补全域名，如oss的https://xxxx.oss-cn-shanghai.aliyuncs.com，或https://your.site.com
			storageBaseUri: "",

			//阿里OSS的上传路径
			uploadOssStatus: false,
			alioss: {
				endpoint: ''
			},
			config: {
				logo: '',
				refund_reasons: [],
				apply_rule: '',
				user_agreement: 0,
				privacy_agreement: 0,
				shop_agreement: 0,
				brand_agreement: 0
			},
			Event: {
				CurrentCityChange: "currentCityChange",
				CurrentCityChange2: "currentCityChange2",
				loginOut: "loginOut",
			},
			location: {
				latitude: '',
				longitude: ''
			},
			defaultCity: {
				id: 104,
				name: '上海市',
				pois: null
			},
		},
		onShow: function(e) {
			if (e.query) {
				if(e.query.openid){
					this.$core.setCache('wx_openid', e.query.openid);
				}
				if (e.query.scene) {
					let scene = decodeURIComponent(e.query.scene);
					let options = {}
					for (var i = 0; i < scene.split('&').length; i++) {
						var arr = scene.split('&')[i].split('=');
						options[arr[0]] = arr[1];
					}
					if (options.uid != 'undefined' && options.uid > 0) {
						let a = {
							expire: 0,
							value: options.uid
						};
						try {
							uni.setStorageSync('puser_id' + this.globalData.appid, a);
						} catch (e) {
							//TODO handle the exception
							console.log(e);
						}

					}
				}

			}
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	@import "@/static/css/global.css";
	@import "@/static/css/jj-shared.css";
	@import "@/uni_modules/uview-ui/index.scss";

	
</style>