#include "contiki.h"
#include "contiki-lib.h"
#include "contiki-net.h"

#include <sys/clock.h>
#include "letmecreate/core/network.h"
#include "letmecreate/core/common.h"
#include <sys/etimer.h>

#include <string.h>
#include <stdio.h>
#include <stdbool.h>

#define UDP_CONNECTION_ADDR "fe80:0:0:0:19:f5ff:fe89:1af0"
#define SERVER_PORT 9876
#define CLIENT_PORT 3001
#define BUFFER_SIZE 128
#define PROC_INTERVAL 20 * CLOCK_SECOND

#ifndef DEVICE_ID
#define DEVICE_ID -1
#endif

#ifndef PAIR_ID
#define PAIR_ID -1
#endif

PROCESS(detect_main, "Main process for detector");
AUTOSTART_PROCESSES(&detect_main);
PROCESS_THREAD(detect_main, ev, data)
{
  PROCESS_BEGIN();
  {
    static struct etimer et;
    static struct uip_udp_conn *connection;
    static char buf[BUFFER_SIZE];
    connection = udp_new_connection(CLIENT_PORT, SERVER_PORT, UDP_CONNECTION_ADDR);

    // wait a bit to try to give the UDP connection a chance... might work?
    etimer_set(&et, CLOCK_SECOND * 20);
    while (true) {
      PROCESS_YIELD();
      if (etimer_expired(&et)) {
        // say hi!
        sprintf(buf, "{\"pair_id\":%d,\"type\":\"detector\",\"device_id\":%d,\"command\":\"id\"}", PAIR_ID, DEVICE_ID);
        udp_packet_send(connection, buf, strlen(buf));
        PROCESS_WAIT_UDP_SENT();
        break;
      }
    }

    etimer_set(&et, PROC_INTERVAL);
    while (true) {
      PROCESS_YIELD();
      if (etimer_expired(&et)) {
        sprintf(buf, "{\"device_id\":%d,\"command\":\"heartbeat\"}", DEVICE_ID);
        udp_packet_send(connection, buf, strlen(buf));
        PROCESS_WAIT_UDP_SENT();
        etimer_restart(&et);
      }
    }
  }
  PROCESS_END();
}