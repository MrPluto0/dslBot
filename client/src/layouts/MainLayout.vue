<template>
  <q-layout view="lHh lpR lFf">
    <q-header elevated class="bg-primary text-white" v-if="top">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg" />
          </q-avatar>
          Quasar Chatting
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="left"
      side="left"
      bordered
      :breakpoint="690"
    >
      <q-toolbar class="bg-grey-3">
        <q-avatar class="cursor-pointer" @click="gotoIndex">
          <img src="https://cdn.quasar.dev/logo-v2/svg/logo.svg" />
        </q-avatar>
        <q-space />
        <q-btn round flat icon="message" />
      </q-toolbar>

      <q-toolbar class="bg-grey-3">
        <q-input
          rounded
          outlined
          dense
          placeholder="搜索用户"
          class="full-width"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </q-toolbar>

      <q-scroll-area style="height: calc(100% - 100px)">
        <q-list>
          <q-item
            v-for="(user, index) in userlist"
            :key="index"
            clickable
            @click="selectUser(index)"
          >
            <q-item-section avatar>
              <q-avatar>
                <img :src="user.avatar" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1">
                {{ user.name }}
              </q-item-label>
              <q-item-label>
                <q-icon name="check" v-if="user.sent" />
                {{ user.message }}
              </q-item-label>
            </q-item-section>

            <q-item-section side>
              <q-item-label caption>
                {{ user.time }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      top: true,
      left: false,
      userlist: [
        {
          id: 1,
          name: '小吃',
          avatar: 'https://img1.baidu.com/it/u=3140442193,476713408&fm=26&fmt=auto',
          message: "We're cooking for you.",
          time: '14:00',
          sent: true,
          script: 'test',
        },
        {
          id: 2,
          name: '走马观花',
          avatar: 'https://img0.baidu.com/it/u=1373006895,102752536&fm=253&fmt=auto&app=120&f=JPEG?w=500&h=500',
          message: 'The love and death',
          time: '10:00',
          sent: true,
          script: 'test4',
        },
      ],
    };
  },
  methods: {
    selectUser(index) {
      this.top = false;
      this.$router.push({
        name: 'chat',
        params: {
          user: encodeURIComponent(JSON.stringify(this.userlist[index])),
        },
      });
    },
    gotoIndex() {
      this.top = true;
      this.$router.push('/');
    },
  },
};
</script>
