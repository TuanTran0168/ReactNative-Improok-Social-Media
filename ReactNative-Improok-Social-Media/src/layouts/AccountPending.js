import React, { useContext, useEffect, useState } from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { MyUserContext } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { djangoAuthApi, endpoints } from '../configs/Apis';
import VectorIcon from '../utils/VectorIcon';
import { Button } from 'native-base';
import { Image } from 'react-native';

const AccountPending = () => {
    const [user, dispatch] = useContext(MyUserContext)
    const [listPendingUser, setListPendingUser] = useState([])
    const [page, setPage] = useState(1)
    const [hasMorePages, setHasMorePages] = useState(true);

    const getPendingUser = async () => {
        try {
            const token = await AsyncStorage.getItem('token')
            let e = `${endpoints['get-user-by-status']}` + `?confirm_status_id=3` + `&page=${page}`
            console.log(e)
            let res = await djangoAuthApi(token).get(e)
            setListPendingUser((prevList) => [...prevList, ...res.data.results]);
            if (res.data.next === null) {
                setHasMorePages(false);
                return;
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchNextPage = () => {
        setPage((prevPage) => prevPage + 1);
    }

    const acceptUser = async (userId) => {
        try {
            const token = await AsyncStorage.getItem('token');
            let res = await djangoAuthApi(token).patch(endpoints['confirm-user'](userId), {
                "confirm_status": 1
            });
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    const rejectUser = async (userId) => {
        try {
            console.log(userId)
            const token = await AsyncStorage.getItem('token');
            let res = await djangoAuthApi(token).patch(endpoints['confirm-user'](userId), {
                "confirm_status": 2
            });
            console.log(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getPendingUser()
    }, [page])

    return (
        <>
            <ScrollView>
                <View style={{ padding: 15, flexDirection: 'column', gap: 8 }}>
                    {listPendingUser.length > 0 ? (
                        listPendingUser.map((lpu) => (
                            <View key={lpu.id} style={{ borderWidth: 1, borderRadius: 10 }}>
                                <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        <Image source={lpu.avatar === null ? require('../images/user.png') : { uri: lpu.avatar }} style={{ width: 30, height: 30, alignItems: 'center', borderRadius: 15 }} />
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 5, alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16 }}>{lpu.user?.last_name}</Text>
                                        <Text style={{ fontSize: 16 }}>{lpu.user?.first_name}</Text>
                                        <Text>{lpu.id}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                                        <TouchableOpacity onPress={() => acceptUser(lpu.user?.id)}>
                                            <VectorIcon
                                                name="checkmark-circle"
                                                type="Ionicons"
                                                size={22}
                                                color="green"
                                            />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => rejectUser(lpu.user?.id)}>
                                            <VectorIcon
                                                name="close-circle"
                                                type="Ionicons"
                                                size={22}
                                                color="red"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>No user here now</Text>
                        </View>
                    )}
                    {hasMorePages && (
                        <Button
                            variant='subtle'
                            colorScheme='purple'
                            onPress={fetchNextPage}
                            style={{ alignItems: 'center', padding: 15 }}
                        >
                            More...
                        </Button>
                    )}
                </View>
            </ScrollView>
        </>
    );
};

export default AccountPending;