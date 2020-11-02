<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框区域 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表表格区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column
          width="230px"
          label="订单编号"
          prop="order_number"
        ></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_statue === '1'"
              >已付款</el-tag
            >
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发送" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showDialogEditAddress"
            ></el-button>
            <!-- 物流进度按钮 -->
            <el-button
              size="mini"
              type="success"
              icon="el-icon-location"
              @click="showProgressDialog"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 点击编辑按钮后弹出来的一个对话框区域 -->
    <el-dialog
      @close="closeDialog"
      title="修改地址"
      :visible.sync="editAddressVisible"
      width="50%"
    >
      <!-- 表单区域 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader
            :options="citydata"
            v-model="addForm.address1"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
    <!-- 显示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- timeline时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in progressInfo"
          :key="index"
          :timestamp="item.time"
          :icon="item.icon"
          :type="item.type"
          :color="item.color"
          :size="item.size"
        >
          {{ item.status }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
// 导入省市区/县的数据文件
import citydata from './citydata.js'
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 订单列表数据
      ordersList: [],
      // 数据总条数
      total: 0,
      // 控制修改地址对话框的显示与隐藏
      editAddressVisible: false,
      // 修改地址的表单数据对象
      addForm: {
        address1: [],
        address2: ''
      },
      // 省市区县的数据
      citydata: citydata,
      // 控制物流进度对话框的显示与隐藏
      progressVisible: false,
      // 物流进度信息的数据
      progressInfo: [],

      // 定义一个发送外部请求获取物流信息的apiKey
      apiKey: '74eVcQWe17a59e7cc73f98a52195327273b3870dcd26d94',
      // 要查询的订单的编号是
      number: '75374604843016',
      // 时间线的图标数组
      icon: [
        'el-icon-more',
        'el-icon-star-off',
        'el-icon-s-flag',
        'el-icon-s-comment',
        'el-icon-s-promotion',
        'el-icon-collection-tag'
      ],
      // 时间线的type类型数组
      type: ['success', 'error', 'danger', 'warning', 'info'],
      // 时间线的颜色数组
      color: ['pinke', 'red', 'green', 'blue', 'skyblue'],
      size: 'large',
      // 表单的验证规则对象
      addFormRules: {
        address1: [
          { required: true, message: '请选择省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细的地址', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', {
        params: this.queryInfo
      })
      // 如果请求发送失败给出错误提示
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据列表失败')
      }
      // 请求成功的时候
      console.log(res)
      // 把订单数据列表保存在私有数据中
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    // 分页区域的每一页显示多少条数据发生改变的时候
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      // 重新刷新列表数据
      this.getOrdersList()
    },
    // 分页区域的当前页发生改变的时候
    handleCurrentChange(newPagenum) {
      this.queryInfo.pagenum = newPagenum
      // 重新刷新列表数据
      this.getOrdersList()
    },
    // 鼠标点击编辑按钮的时候触发
    showDialogEditAddress() {
      // 让修改地址的对话框显示出来
      this.editAddressVisible = true
    },
    // 当对话框关闭的时候
    closeDialog() {
      // 重置表单内容
      this.$refs.addFormRef.resetFields()
    },
    // 当点击了物流进度按钮的时候
    async showProgressDialog() {
      // 弹出物流进度对话框
      this.progressVisible = true
      // 发送请求获取到物流进度信息数据
      const res = await fetch(
        `https://api.apishop.net/common/express/getExpressInfo?apiKey=${this.apiKey}&expressNumber=${this.number}`
      ).catch(err => err)
      const result = await res.json()
      // .then(data => {
      //   this.progressInfo = data.result.list
      //   console.log(this.progressInfo)
      // })
      // 如果请求发送失败
      if (result.statusCode !== '000000') {
        this.$message.error('获取物流信息失败')
      }
      // 请求发送成功了
      this.progressInfo = result.result.list
      this.progressInfo.forEach(item => {
        item.color = this.color[this.getRandom(0, this.color.length - 1)]
        item.icon = this.icon[this.getRandom(0, this.icon.length - 1)]
        item.type = this.type[this.getRandom(0, this.type.length - 1)]
        item.size = this.size
      })
      console.log(this.progressInfo)
    },
    // 定义一个生成随机数的函数
    getRandom(min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min)
    }
  }
}
</script>
<style lang="less" scoped>
// @import '../../plugins/timeline/timeline.css';
// @import '../../plugins/timeline-item/timeline-item.css';
</style>
