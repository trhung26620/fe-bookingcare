import React, { Component } from 'react';
import { connect } from "react-redux";
import './ManageSchedule.scss'
import { FormattedMessage } from 'react-intl'
import Select from 'react-select';
import * as actions from "../../../store/actions";
import { CRUD_ACTIONS, LANGUAGES, dateFormat } from '../../../utils';
import DatePicker from '../../../components/Input/DatePicker';
import moment from 'moment';
import { toast } from "react-toastify";
import _ from 'lodash';
import { saveBulkScheduleDoctor, getDoctorInfoById } from '../../../services/userService'

class ManageSchedule extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // listDoctors: [],
            doctor: [],
            selectedDoctor: {},
            currentDate: '',
            rangeTime: []
        }
    }

    componentDidMount() {
        // if(this.userInfo)
        // await getDoctorInfoById()
        // this.props.fetchAllDoctors();
        this.props.fetchAllScheduleTime();
        let data = this.buildDataInputSelect();
        if (data && data.length > 0) {
            this.setState({
                doctor: [...data],
                selectedDoctor: data[0]
            })
        }
    }

    componentDidUpdate(prevProps, preState, snapshot) {
        // if (prevProps.allDoctors !== this.props.allDoctors) {
        //     let dataSelect = this.buildDataInputSelect(this.props.allDoctors)
        //     this.setState({
        //         doctor: dataSelect
        //     })
        // }
        if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
            let data = this.props.allScheduleTime
            if (data && data.length > 0) {
                data = data.map(item => ({
                    ...item,
                    isSelected: false
                }))
            }
            this.setState({
                rangeTime: data
            })
        }

        // if (prevProps.language !== this.props.language) {
        //     let dataSelect = this.buildDataInputSelect(this.props.allDoctors)
        //     this.setState({
        //         doctor: dataSelect
        //     })
        // }
    }

    buildDataInputSelect = () => {
        let result = [];
        let { language } = this.props;
        // if (inputData && inputData.length > 0) {
        //     inputData.map((item, index) => {
        //         let object = {};
        //         let labelVi = `${item.lastName} ${item.firstName}`
        //         let labelEn = `${item.firstName} ${item.lastName}`
        //         object.label = language === LANGUAGES.VI ? labelVi : labelEn
        //         object.value = item.id;
        //         result.push(object)
        //     })
        // }
        if (this.props.userInfo) {
            let item = this.props.userInfo;
            let object = {};
            let labelVi = `${item.lastName} ${item.firstName}`
            let labelEn = `${item.firstName} ${item.lastName}`
            object.label = language === LANGUAGES.VI ? labelVi : labelEn
            object.value = item.id;
            // object.isDisabled = true;
            result.push(object)
        }
        return result
    }

    handleChangeSelect = async (selectedOption) => {
        this.setState({ selectedDoctor: selectedOption });
    };

    handleOnchangeDatePicker = (date) => {
        this.setState({
            currentDate: date[0]
        })
    }

    handleClickBtnTime = (time) => {
        let { rangeTime } = this.state;
        if (rangeTime && rangeTime.length > 0) {
            rangeTime = rangeTime.map(item => {
                if (item.id === time.id) item.isSelected = !item.isSelected;
                return item;
            }
            )
            this.setState({
                rangeTime: rangeTime
            })
        }
    }

    handleSaveSchedule = async () => {
        let { rangeTime, selectedDoctor, currentDate } = this.state;
        let result = [];
        if (!currentDate) {
            toast.error("Invalid date!");
            return;
        }
        if (selectedDoctor && _.isEmpty(selectedDoctor)) {
            toast.error("Invalid selected doctor!");
            return;
        }

        let formatedDate = new Date(currentDate).getTime();

        if (formatedDate === 'Invalid date') {
            toast.error("Invalid date!");
            return;
        }
        if (rangeTime && rangeTime.length > 0) {
            let selectedTime = rangeTime.filter(item => item.isSelected === true);
            if (selectedTime && selectedTime.length > 0) {
                selectedTime.map((schedule, index) => {
                    let object = {};
                    object.doctorId = selectedDoctor.value;
                    object.date = formatedDate;
                    object.timeType = schedule.keyMap;
                    result.push(object)
                })

            } else {
                toast.error("Invalid selected time!");
                return;
            }
        }
        let res = null;
        try {
            res = await saveBulkScheduleDoctor({
                arrSchedule: result,
                doctorId: selectedDoctor.value,
                formatedDate: formatedDate.toString()
            })
            if (res && res.errCode === 0) {
                toast.success("Save Infor Succeed");
            } else if (res && res.errCode === 2) {
                toast.error(res.errMessage);
            } else {
                toast.error("error saveBulkScheduleDoctor");
            }
        } catch (error) {
            if (error.response && error.response.status === 403) {
                toast.error("Permission denied!");
            } else {
                toast.error("error saveBulkScheduleDoctor");
            }
        }

        // let res = new Promise(async (resolve, reject) => {
        //     try {
        //         let data = await saveBulkScheduleDoctor({
        //             arrSchedule: result,
        //             doctorId: selectedDoctor.value,
        //             formatedDate: formatedDate.toString()
        //         })
        //         resolve(data)
        //     } catch (error) {
        //         reject(error)
        //     }
        // })
        // res.then((data) => console.log(data));
        // console.log("debuggggggggggg3")


    }
    render() {
        let { rangeTime } = this.state
        let { language } = this.props
        let yesterday = new Date(new Date().setDate(new Date().getDate() - 1));
        console.log("=====Debug22222222=====")
        return (
            <div className='manage-schedule-container'>
                <div className='m-s-title'>
                    <FormattedMessage id="manage-schedule.title" />
                </div>
                <div className='container'>
                    <div className='row'>
                        <div className='col-6'>
                            <label><FormattedMessage id="manage-schedule.choose-doctor" /></label>
                            <Select
                                value={this.state.selectedDoctor}
                                onChange={this.handleChangeSelect}
                                options={this.state.doctor}
                            // isOptionDisabled={(option) => option.disabled}
                            // isOptionDisabled={false}
                            />
                        </div>
                        <div className='col-6'>
                            <label><FormattedMessage id="manage-schedule.choose-date" /></label>
                            <DatePicker
                                onChange={this.handleOnchangeDatePicker}
                                className="form-control"
                                value={this.state.currentDate}
                                minDate={yesterday}
                            />
                        </div>
                        <div className='col-12 pick-hour-container'>
                            {rangeTime && rangeTime.length > 0 &&
                                rangeTime.map((item, index) => {
                                    return (
                                        <button
                                            className={item.isSelected === true ? 'btn btn-schedule active' : 'btn btn-schedule'}
                                            key={index}
                                            onClick={() => this.handleClickBtnTime(item)}
                                        >
                                            {language === LANGUAGES.VI ? item.valueVi : item.valueEn}
                                        </button>
                                    )
                                })
                            }
                        </div>
                        <div className='col-12'>
                            <button className='btn btn-primary btn-save-schedule'
                                onClick={() => this.handleSaveSchedule()}
                            ><FormattedMessage id="manage-schedule.save" /></button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        isLoggedIn: state.user.isLoggedIn,
        // allDoctors: state.admin.allDoctors,
        language: state.app.language,
        allScheduleTime: state.admin.allScheduleTime,
        userInfo: state.user.userInfo
    };
};

const mapDispatchToProps = dispatch => {
    return {
        // fetchAllDoctors: () => dispatch(actions.fetchAllDoctors()),
        fetchAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
