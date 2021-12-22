<template>
  <q-page class="flex flex-center column">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />
    <q-card
      class="card"
      style="width: 200px;margin-top:20px"
      v-for="(user, index) in loginUsers"
      :key="index"
      @click="changeLoginUser(user)"
    >
      <q-item>
        <q-item-section avatar>
          <q-avatar>
            <img :src="user.avatar" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label>{{ user.name }}</q-item-label>
          <q-item-label caption>余额:{{ user.account }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PageIndex',
  data() {
    return {
      loginUsers: [
        {
          name: 'gypsophlia',
          avatar:
            'https://img2.baidu.com/it/u=3183763440,2192017876&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500',
          account: 100,
        },
        {
          name: 'pluto',
          avatar: 'https://img0.baidu.com/it/u=1967997459,1022958762&fm=26&fmt=auto',
          account: 100,
        },
      ],
    };
  },
  methods: {
    changeLoginUser(user) {
      this.$store.commit('user/updateUser', user);
      this.$q.dialog({
        title: '提示',
        message: `切换用户${user.name}成功`,
      });
    },
  },
});
</script>

<style>
.card {
  cursor: pointer;
}
</style>
