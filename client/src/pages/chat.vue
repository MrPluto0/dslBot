<template>
  <q-layout class="chat-wrapper">
    <q-header elevated class="bg-grey-3 text-black">
      <q-toolbar>
        <q-avatar>
          <img :src="user.avatar" />
        </q-avatar>
        <q-toolbar-title style="font-size: 16px">
          {{ user.name }}
        </q-toolbar-title>
        <q-space />
        <q-btn round flat icon="delete" @click="clearMessageBox"></q-btn>
        <q-btn round flat icon="more_vert" @click="test"></q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container class="bg-grey-2" style="height: 100%">
      <q-scroll-area class="messageBox" style="height: 100%" ref="scroll">
        <q-space />
        <q-chat-message :label="date" />
        <q-chat-message
          v-for="(message, index) in messageBox"
          :key="index"
          :name="message.name"
          :stamp="message.time"
          :text="message.text"
          :avatar="message.avatar"
          :sent="message.sent"
        >
        </q-chat-message>
      </q-scroll-area>
    </q-page-container>

    <q-footer>
      <q-toolbar class="bg-grey-3 text-black row">
        <q-btn round flat icon="insert_emoticon"></q-btn>
        <q-input
          rounded
          outlined
          dense
          bg-color="white"
          class="col-grow q-mr-sm"
          v-model="message"
          placeholder="输入信息"
          @keydown.enter="sendMsg()"
        ></q-input>
        <q-btn round flat icon="send" @click="sendMsg()"></q-btn>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { onMounted, ref } from 'vue';
import date from '../utils/date';
import debounce from '../utils/debounce';
import throttle from '../utils/throttle';

export default {
  data() {
    return {
      ws: null,
      user: {
        id: 1,
        name: '',
        avatar: '',
        message: '',
        time: '',
        sent: true,
        scrollMsg: null,
        script: '',
      },
      message: '',
      messageBox: [],
    };
  },
  setup() {
    const scroll = ref(null);
    onMounted(() => {
      //
    });
    return {
      scroll,
    };
  },
  mounted() {
    // console.log(window.myAPI);
    this.init();
  },
  updated() {
    this.init();
  },
  computed: {
    date() {
      return date.getDate();
    },
    time() {
      return date.getTime();
    },
  },
  methods: {
    test() {
      this.scrollMsg();
    },
    init() {
      this.initUser();
      this.initWS();
      this.scrollMsg = debounce(this.scrollMessageBox, 500);
      this.sendMsg = throttle(this.sendMessage, 200);
      this.receiveMsg = throttle(this.receiveMessage, 200);
    },
    initUser() {
      try {
        const { user } = this.$route.params;
        this.user = JSON.parse(decodeURIComponent(user));

        const content = localStorage.getItem(`${this.user.name}:messageBox`);
        this.messageBox = JSON.parse(content) || [];
        console.log('Get MessageBox from local history.');
      } catch (e) {
        localStorage.removeItem(`${this.user.name}:messageBox`);
        this.messageBox = [];
      }
    },
    initWS() {
      const { user } = this.$store.state;
      this.ws = new WebSocket('ws://localhost:8080');

      this.ws.onopen = () => {
        console.log('Open Socket.');

        this.ws.send(JSON.stringify({
          type: 'init',
          data: user,
          script: this.user.script,
        }));

        this.ws.onmessage = (event) => {
          // console.log(event);
          if (event.data instanceof Blob) {
            const reader = new FileReader();

            // reader.readAsArrayBuffer(event.data);
            reader.readAsText(event.data, 'utf8');

            reader.onload = () => {
              // Blob to String
              const message = reader.result;
              this.receiveMsg(message);
            };
          } else if (typeof event.data === 'string') {
            this.receiveMsg(event.data);
          }
        };
      };

      setTimeout(() => {
        if (this.ws.readyState === 0) {
          this.$q.dialog({
            title: '提示',
            message: 'WebSocket连接失败',
          });
        }
      }, 1000);
    },
    sendMessage(msg = this.message) {
      const { user } = this.$store.state;
      if (msg !== '') {
        // console.log(this.messageBox);
        const len = this.messageBox.length;
        if (
          len > 0
          && this.messageBox[len - 1].sent
          && this.messageBox[len - 1]?.time === this.time
        ) {
          this.messageBox[len - 1].text.push(msg);
        } else {
          this.messageBox.push({
            name: user?.name,
            avatar: user?.avatar,
            time: this.time,
            text: [msg],
            sent: true,
          });
        }
        if (this.ws.readyState === this.ws.CLOSED) {
          this.initWS();
        } else {
          this.ws.send(JSON.stringify({
            type: 'message',
            data: msg,
          }));
        }
      }
      this.scrollMsg();
      this.message = '';
    },
    receiveMessage(message) {
      console.log('receive %s', message);
      const msg = JSON.parse(message);
      if (msg.type === 'message') {
        const len = this.messageBox.length;
        if (
          len > 0
            && this.messageBox[len - 1]?.sent === false
            && this.messageBox[len - 1]?.time === this.time
        ) {
          this.messageBox[len - 1].text.push(msg.data);
        } else {
          this.messageBox.push({
            name: this.user?.name,
            avatar: this.user?.avatar,
            time: this.time,
            text: [msg.data],
            sent: false,
          });
        }
        this.scrollMsg();
      } else if (msg.type === 'close') {
        console.log(msg);
        this.$store.commit('user/updateAccount', msg.data.account || 100);
      }
    },
    scrollMessageBox(ms = 200) {
      const obj = this.scroll.getScrollTarget();
      const scrollTop = obj.scrollHeight - obj.offsetHeight;
      this.scroll.setScrollPosition('vertical', scrollTop, ms);
    },
    clearMessageBox() {
      localStorage.removeItem(`${this.user.name}:messageBox`);
      this.messageBox = [];
    },
  },
  watch: {
    messageBox: {
      handler() {
        localStorage.setItem(
          `${this.user.name}:messageBox`,
          JSON.stringify(this.messageBox),
        );
      },
      deep: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.chat-wrapper {
  height: 100vh;
}
.messageBox {
  padding: 0 20px;
}
</style>
