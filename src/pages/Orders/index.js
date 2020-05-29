import React, { useEffect, useState } from 'react';
import { addMinutes, format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import socketIOClient from 'socket.io-client';

import './styles.scss';

import logoImg from '../../assets/logo.png';
import ifoodImg from '../../assets/ifood.png';

const socket = socketIOClient(process.env.REACT_APP_API_URL);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [currentTime, setCurrentTime] = useState([]);
  const [intervalRealtime, setIntervalRealtime] = useState([]);

  function setTimezone(date) {
    const timezone = process.env.REACT_APP_TIMEZONE;
    const newDate = format(utcToZonedTime(date, timezone), 'HH:mm');
    return newDate;
  }

  function setDeadline(date, deadline) {
    const deadlineDate = format(addMinutes(parseISO(date), deadline), 'HH:mm');
    return deadlineDate;
  }

  function realtime() {
    setIntervalRealtime(setInterval(() => setCurrentTime(setTimezone(new Date())), 60000));
  }

  useEffect(() => {
    socket.on('orders', (response) => {
      const data = response.map(({ createdAt, deadline, ...rest }) => ({
        createdAt: setTimezone(createdAt),
        deadline,
        deadlineDate: setDeadline(createdAt, deadline || 40),
        rest,
      }));

      setOrders(data);
    });
  }, []);

  useEffect(() => {
    setCurrentTime(setTimezone(new Date()));
    realtime();

    return clearInterval(intervalRealtime);
  }, []);

  return (
    <div className="ordersContainer">
      <div className="header">
        <div className="logo">
          <img src={logoImg} alt="Pontal Burger" />
        </div>
        <div className="dateAndTitle">
          <span>{currentTime}</span>
          <h2>Pedidos</h2>
        </div>
      </div>

      <div className="content">
        { orders.length > 0 ? (
          <ul>
            {orders.map((order) => (
              <li key={order.rest.id}>
                <div className="headerCardOrder">
                  <h3>
                    Pedido #
                    {order.rest.internalCode}
                  </h3>
                  {order.rest.paymentId === 4
                  && <img src={ifoodImg} alt="ifood" />}
                </div>
                <p>
                  Horário do pedido:
                  {' '}
                  {order.createdAt}
                </p>
                <p>
                  Entregar até:
                  {' '}
                  {order.deadlineDate}
                </p>
                <div className="items">
                  {order.rest.items.map((selectedItem) => (
                    <p key={selectedItem.id}>
                      {selectedItem.ItemsOrders.count}
                      {' '}
                      {selectedItem.name}
                    </p>
                  ))}
                </div>
                {order.rest.observation
              && (
                <div className="observation">
                  <p>
                    <b>Observação:</b>
                    {' '}
                    {order.rest.observation}
                  </p>
                </div>
              )}
              </li>
            ))}
          </ul>
        ) : <h2 className="noOrders">Sem pedidos por aqui :(</h2> }
      </div>
    </div>
  );
}
