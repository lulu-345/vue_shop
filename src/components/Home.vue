<template>
  <el-container>
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面内容主体区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <div class="collapse-button" @click="collapseMenu">
          |||
        </div>
        <el-menu
          :default-active="activePath"
          router
          :collapse-transition="false"
          :collapse="isCollapse"
          unique-opened
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
        >
          <!-- 一级菜单 -->
          <el-submenu
            :index="item.id + ''"
            v-for="item in menulist"
            :key="item.id"
          >
            <!-- 一级菜单的模板区域 -->
            <template slot="title">
              <!-- 小图标 -->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              @click="saveNavState('/' + menuItem.path)"
              :index="'/' + menuItem.path"
              v-for="menuItem in item.children"
              :key="menuItem.id"
            >
              <!-- 二级菜单模板区域 -->
              <template slot="title">
                <!-- 小图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ menuItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体区域 -->
      <el-main>
        <!-- 添加一个路由占位符号 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  // 生命周期created函数用来在页面一上来执行
  created() {
    // 页面一上来的时候就从本地的sessionStorage中拿数据赋值给activePath
    this.activePath = window.sessionStorage.getItem('status')
    // 调用getMenuList函数获取左侧菜单列表数据
    this.getMenuList()
  },
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  methods: {
    // 实现退出功能
    logout() {
      // 清空本地sessionStorage的token
      window.sessionStorage.clear()
      // 页面跳转到登录页面
      this.$router.push('/login')
    },
    // 获取左侧菜单数据的函数
    async getMenuList() {
      const { data: res } = await this.$http.get('menus')
      // console.log(res)
      // 如果获取列表失败给出提示信息
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 代码能走到这一步说明请求成功，把获取到的数据保存在自己的私有数据中
      this.menulist = res.data
      // console.log(this.menulist)
    },
    // 折叠菜单栏
    collapseMenu() {
      this.isCollapse = !this.isCollapse
    },
    // 实现被激活的二级菜单高亮保持
    saveNavState(state) {
      // 将数据保存在本地的sessionStorage中
      window.sessionStorage.setItem('status', state)
      this.activePath = state
    }
  }
}
</script>

<style lang="less" scoped>
.el-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #373d41;
  color: #ffffff;
  font-size: 20px;
  padding-left: 0;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .collapse-button {
    color: #fff;
    text-align: center;
    background-color: #4a5064;
    font-size: 10px;
    line-height: 20px;
    letter-spacing: 0.2em;
    cursor: pointer;
  }
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
</style>
