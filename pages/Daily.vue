<template>
  <div>
    <el-container v-loading="loading">
      <el-header>
        <h1>日计划</h1>
      </el-header>
      <el-container>
        <el-main>
          <template>
            <el-button
              v-if="date"
              icon="el-icon-arrow-left"
              @click="changeDay(-1)"
              >前一天
            </el-button>
            <el-date-picker
              v-model="date"
              type="date"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              placeholder="选择日期"
            >
            </el-date-picker>
            <el-button v-if="date" @click="changeDay(1)"
              >后一天 <i class="el-icon-arrow-right el-icon--right"></i
            ></el-button>
            <el-button
              type="primary"
              icon="el-icon-upload2"
              @click="savePdcaData"
              >同步到服务器
            </el-button>
            <el-button
              type="primary"
              icon="el-icon-download"
              @click="loadPdcaData"
              >获取数据
            </el-button>
            <el-button type="primary" icon="el-icon-plus" @click="drawer = true"
              >新增计划
            </el-button>
          </template>
          <el-divider />
          <el-drawer
            :visible.sync="drawer"
            :direction="'btt'"
            :with-header="false"
          >
            <el-container>
              <el-main>
                <el-form ref="toAppend" :model="toAppend" :rules="rules">
                  <el-row>
                    <el-col :span="8">
                      <div class="grid-content bg-purple">
                        <el-form-item prop="start_time">
                          <el-time-select
                            v-model="toAppend.start_time"
                            :picker-options="{
                              start: '00:00',
                              step: '01:00',
                              end: '24:00'
                            }"
                            placeholder="开始时间"
                          >
                          </el-time-select>
                        </el-form-item>
                      </div>
                    </el-col>
                    <el-col :span="8">
                      <div class="grid-content bg-purple-light">
                        <el-form-item prop="end_time">
                          <el-time-select
                            v-model="toAppend.end_time"
                            :picker-options="{
                              start: toAppend.start_time || '00:00',
                              step: '00:15',
                              end: '24:00'
                            }"
                            placeholder="结束时间"
                          >
                          </el-time-select>
                        </el-form-item>
                      </div>
                    </el-col>
                  </el-row>
                  <div class="grid-content bg-purple">
                    <el-form-item prop="plan">
                      <el-input
                        v-model="toAppend.plan"
                        placeholder="计划内容"
                      />
                    </el-form-item>
                  </div>
                  <div class="grid-content bg-purple-light">
                    <el-form-item>
                      <el-button
                        icon="el-icon-plus"
                        type="primary"
                        @click="submitForm('toAppend')"
                        >新增计划
                      </el-button>
                    </el-form-item>
                  </div>
                </el-form>
              </el-main>
            </el-container>
          </el-drawer>

          <el-divider />
          <template>
            <el-table :data="plan.plan_and_do" style="width: 100%">
              <el-table-column label="开始" width="180">
                <template slot-scope="scope">
                  <i class="el-icon-time"></i>
                  <span style="margin-left: 10px">{{
                    scope.row.start_time
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="结束" width="180">
                <template slot-scope="scope">
                  <i class="el-icon-time"></i>
                  <span style="margin-left: 10px">{{
                    scope.row.end_time
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column label="计划" width="180">
                <template slot-scope="scope">
                  {{ scope.row.plan }}
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    :type="scope.row.finished ? 'success' : ''"
                    @click="handleEdit(scope.$index, scope.row)"
                  >
                    {{ scope.row.finished ? '已完成' : '未完成' }}
                  </el-button>
                  <el-button
                    icon="el-icon-delete"
                    size="mini"
                    type="danger"
                    @click="handleDelete(scope.$index, scope.row)"
                    >删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-input
              v-model="plan.check"
              type="textarea"
              :rows="2"
              placeholder="Check"
            >
            </el-input>
            <el-input
              v-model="plan.action"
              type="textarea"
              :rows="2"
              placeholder="Action"
            >
            </el-input>
          </template>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import * as R from 'ramda'

import { mapMutations, mapState } from 'vuex'

const initPlanRow = () => {
  return {
    start_time: '',
    end_time: '',
    plan: '',
    finished: '',
    reason: ''
  }
}
const initStruct = () => {
  return {
    _id: undefined,
    plan_and_do: [],
    data: '',
    check: '',
    action: ''
  }
}
const formatDate = (date) => {
  const yyyy = date.getFullYear()
  const mm = `0${date.getMonth() + 1}`.substr(-2)
  const dd = `0${date.getDate()}`.substr(-2)
  return `${yyyy}-${mm}-${dd}`
}
export default {
  name: 'Daily',
  data() {
    return {
      loading: true,
      drawer: false,
      date: '',
      plan: initStruct(),
      toAppend: initPlanRow(),
      rules: {
        start_time: [
          {
            validator: (_rule, value, callback) => {
              if (value === '') {
                callback(new Error('请选择开始日期'))
              } else if (
                this.toAppend.end_time !== '' &&
                value > this.toAppend.end_time
              ) {
                callback(new Error('开始时间应早于结束时间'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        end_time: [
          {
            validator: (_rule, value, callback) => {
              if (value === '') {
                callback(new Error('请选择结束日期'))
              } else if (
                this.toAppend.start_time !== '' &&
                value < this.toAppend.start_time
              ) {
                callback(new Error('结束时间应晚于开始时间'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ],
        plan: [
          {
            validator: (_rule, value, callback) => {
              if (value === '') {
                callback(new Error('请填写计划'))
              } else {
                callback()
              }
            },
            trigger: 'blur'
          }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      date2plan: 'daily/date2plan'
    })
  },
  watch: {
    date() {
      if (this.date) {
        this.loadPdcaData()
      }
    }
  },
  mounted() {
    this.date = formatDate(new Date())
  },
  methods: {
    changeDay(derDay) {
      const date = new Date(this.date)
      date.setTime(date.getTime() + derDay * 3600 * 1000 * 24)
      this.date = formatDate(date)
    },
    ...mapMutations({
      updateDate2Plan: 'daily/updateDate2Plan'
    }),
    savePdcaData() {
      if (!this.date) {
        this.$message.warning({
          message: '请选择日期'
        })
        return
      }
      this.plan.date = this.date
      this.wrapLoading(() =>
        fetch('/api/add_daily_pdca', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(this.plan)
        })
      )
        .then((response) => {
          if (response.status !== 200) {
            throw new Error(response.statusText)
          }
          return response.json()
        })
        .then((myJson) => {
          this.plan._id = myJson.insertedId
          this.$message.success({
            message: '保存成功',
            duration: 1000
          })
        })
        .catch((err) => {
          this.$message.error({
            message: err
          })
        })
    },
    loadPdcaData() {
      // TODO rxjx Support the interrupt
      if (!this.date) {
        this.$message.warning({
          message: '请选择日期'
        })
        return
      }
      const queryData = {
        date: this.date
      }

      this.wrapLoading(() =>
        fetch('/api/get_daily_pdca', {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify(queryData)
        })
      )
        .then((response) => {
          if (response.status === 404) {
            return initStruct()
          } else if (response.status !== 200) {
            throw new Error(response.statusText)
          }
          return response.json()
        })
        .then((myJson) => {
          this.plan = myJson
          this.$message.success({
            message: '已获取数据',
            duration: 1000
          })
        })
        .catch((err) => {
          this.$message.error({
            message: err
          })
        })
    },
    async wrapLoading(fn) {
      this.loading = true
      const r = await fn()
      this.loading = false
      return r
    },
    submitForm(formRefName) {
      this.$refs[formRefName]
        .validate()
        .then(() => {
          this.plan.plan_and_do.push(this.toAppend)
          this.toAppend = R.clone(this.toAppend)
          this.plan.plan_and_do.sort((A, B) => {
            if (A.start_time === B.start_time) {
              return A.end_time < B.end_time ? -1 : 1
            }
            return A.start_time < B.start_time ? -1 : 1
          })
        })
        .catch(console.warn)
    },
    handleEdit(index, _row) {
      this.plan.plan_and_do[index].finished = this.plan.plan_and_do[index]
        .finished
        ? ''
        : 'finished'
      this.$set(this.plan.plan_and_do, index, this.plan.plan_and_do[index])
    },
    // TODO 弹框编辑
    handleDelete(_index, _row) {
      this.plan.plan_and_do.splice(_index, 1)
    }
  }
}
</script>

<style scoped></style>
