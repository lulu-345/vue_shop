<template>
  <div>
    <el-button type="info" @click="logout">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    // 实现退出功能
    logout() {
      // 清空本地sessionStorage的token
      window.sessionStorage.clear()
      // 页面跳转到登录页面
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped></style>
