import React, { useEffect, useState } from 'react';
import { addMinutes, format, parseISO } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import socketIOClient from 'socket.io-client';

import './styles.scss';

const socket = socketIOClient(process.env.REACT_APP_API_URL);

export default function Orders() {
  const [orders, setOrders] = useState([]);

  function setTimezone(date) {
    const timezone = process.env.REACT_APP_TIMEZONE;
    const newDate = format(utcToZonedTime(date, timezone), 'HH:mm');
    return newDate;
  }

  function setDeadline(date, deadline) {
    const deadlineDate = format(addMinutes(parseISO(date), deadline), 'HH:mm');
    return deadlineDate;
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

  return (
    <div className="ordersContainer">
      <div className="header">
        <h2>Pedidos</h2>
      </div>

      <div className="content">
        <ul>
          {orders.map((order) => (
            <li key={order.rest.id}>
              <div className="headerCardOrder">
                <h3>
                  Pedido #
                  {order.rest.internalCode}
                </h3>
                <p>
                  {Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(order.rest.total)}
                </p>
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
      </div>
    </div>
  );
}
